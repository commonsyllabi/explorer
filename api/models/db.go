package models

import (
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
	if os.Getenv("RUN_FIXTURES") == "true" || os.Getenv("API_MODE") == "test" {
		err = runFixtures(true)
		if err != nil {
			zero.Errorf("error running fixtures: %v", err)
			return db, err
		}
	} else {
		zero.Debug("RUN_FIXTURES env variable not set to true, skipping fixtures...")
	}

	return db, err
}

func runFixtures(shouldTruncateTables bool) error {
	var err error

	if shouldTruncateTables {
		err := db.Exec("TRUNCATE TABLE users CASCADE").Error
		if err != nil {
			return err
		}

		err = db.Exec("TRUNCATE TABLE institutions CASCADE").Error
		if err != nil {
			return err
		}

		err = db.Exec("TRUNCATE TABLE tokens CASCADE").Error
		if err != nil {
			return err
		}
	}

	bytes, err := os.ReadFile(filepath.Join(Basepath, "fixtures", "full.yml"))
	if err != nil {
		return err
	}

	users := make([]User, 0)
	err = yaml.Unmarshal(bytes, &users)
	if err != nil {
		return err
	}
	inst := Institution{
		Name:     "Sciences Po",
		Country:  250,
		Position: "lecturer",
		Date: Date{
			Term: "fall",
			Year: 2021,
		},
	}
	users[0].Institutions = append(users[0].Institutions, inst)

	for _, u := range users {

		err := db.Create(&u).Error
		if err != nil {
			return err
		}
	}

	//-- populate collection with 1 syll
	err = db.Model(&users[0].Collections[0]).Association("Syllabi").Append(&users[0].Syllabi[0])
	if err != nil {
		return err
	}

	//-- populate syllabus with 1 inst
	err = db.Model(&users[0].Syllabi[0]).Association("Institutions").Append(&inst)
	if err != nil {
		return err
	}

	token := Token{
		UUID:   uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c801"),
		UserID: uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c800"),
	}

	token_recovery := Token{
		UUID:   uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c901"),
		UserID: uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c800"),
	}

	err = db.Create(&token).Error
	if err != nil {
		return err
	}

	err = db.Create(&token_recovery).Error
	if err != nil {
		return err
	}

	return err
}
