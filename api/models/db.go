package models

import (
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"runtime"

	zero "github.com/commonsyllabi/explorer/api/logger"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/google/uuid"
	"gopkg.in/yaml.v2"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	db         *gorm.DB
	_, b, _, _ = runtime.Caller(0)
	Basepath   = filepath.Dir(b)
)

func InitDB(url string) (*gorm.DB, error) {
	var err error

	conf := &gorm.Config{}
	if os.Getenv("API_MODE") == "release" {
		conf.Logger = logger.Default.LogMode(logger.Silent)
	}

	db, err = gorm.Open(postgres.Open(url), conf)
	if err != nil {
		return db, err
	}

	result := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
	if result.Error != nil {
		return db, result.Error
	}

	// migration
	err = db.AutoMigrate(&User{}, &Collection{}, &Syllabus{}, &Attachment{}, &Token{}, &Institution{})
	if err != nil {
		zero.Errorf("error running migrations: %v", err)
		log.Fatal(err)
	}

	// fixtures
	err = runFixtures(true)
	if err != nil {
		zero.Errorf("error running fixtures: %v", err)
		return db, err
	}

	return db, err
}

func runFixtures(shouldTruncateTables bool) error {
	var err error

	if shouldTruncateTables {
		result := db.Exec("TRUNCATE TABLE users CASCADE")
		if result.Error != nil {
			return result.Error
		}

		result = db.Exec("TRUNCATE TABLE tokens CASCADE")
		if result.Error != nil {
			return result.Error
		}
	}

	bytes, err := ioutil.ReadFile(filepath.Join(Basepath, "fixtures", "full.yml"))
	if err != nil {
		return err
	}

	users := make([]User, 0)
	err = yaml.Unmarshal(bytes, &users)
	if err != nil {
		return err
	}

	for _, u := range users {
		result := db.Create(&u)
		if result.Error != nil {
			return result.Error
		}
	}

	db.Model(&users[0].Collections[0]).Association("Syllabi").Append(&users[0].Syllabi[0])

	db.Model(&users[0].Collections[0]).Association("Syllabi").Append(&users[0].Institutions[0])

	token := Token{
		UUID:   uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c801"),
		UserID: uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c800"),
	}

	token_recovery := Token{
		UUID:   uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c901"),
		UserID: uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c800"),
	}

	result := db.Create(&token)
	if result.Error != nil {
		return result.Error
	}

	result = db.Create(&token_recovery)
	if result.Error != nil {
		return result.Error
	}

	return err
}
