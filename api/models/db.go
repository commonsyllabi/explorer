package models

import (
	"io/ioutil"
	"log"
	"path/filepath"
	"runtime"

	zero "github.com/commonsyllabi/explorer/api/logger"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"gopkg.in/yaml.v2"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	db         *gorm.DB
	_, b, _, _ = runtime.Caller(0)
	Basepath   = filepath.Dir(b)
)

func InitDB(url string) (*gorm.DB, error) {
	var err error
	db, err = gorm.Open(postgres.Open(url), &gorm.Config{})
	if err != nil {
		return db, err
	}

	result := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
	if result.Error != nil {
		return db, result.Error
	}

	// migration
	err = db.AutoMigrate(&User{}, &Collection{}, &Syllabus{}, &Resource{})
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
			return err
		}
	}

	db.Model(&users[0].Collections[0]).Association("Syllabi").Append(&users[0].Syllabi[0])

	return err
}
