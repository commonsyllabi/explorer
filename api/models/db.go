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
	// sslMode := false
	// if strings.HasSuffix(url, "sslmode=require") {
	// 	sslMode = true
	// }

	dsn := "host=localhost user=postgres password=postgres dbname=testy port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return db, err
	}

	// migration
	err = db.AutoMigrate(&User{}, &Collection{}, &Syllabus{}, &Resource{})
	if err != nil {
		zero.Errorf("error running migrations: %v", err)
		log.Fatal(err)
	}

	// fixtures

	err = runFixtures(db, true)
	if err != nil {
		zero.Errorf("error running fixtures: %v", err)
		return db, err
	}

	return db, err
}

func runFixtures(_db *gorm.DB, shouldTruncateTables bool) error {
	var err error

	if shouldTruncateTables {
		result := _db.Exec("TRUNCATE TABLE users CASCADE")
		if result.Error != nil {
			return result.Error
		}
	}

	bytes, err := ioutil.ReadFile(filepath.Join(Basepath, "fixtures", "user.yml"))
	if err != nil {
		return err
	}

	users := make([]User, 0)
	err = yaml.Unmarshal(bytes, &users)
	if err != nil {
		return err
	}

	for _, user := range users {
		result := _db.Create(&user)
		if result.Error != nil {
			return err
		}
	}
	// first truncate the tables (might not be necessary with the AutoMigrate call to create tables)

	// then load the yaml
	// bytes, err := ioutil.ReadFile(filepath.Join(Basepath, "fixtures", "user.yml"))
	// if err != nil {
	// 	return err
	// }

	// users := make([]User, 0)
	// err = yaml.Unmarshal(bytes, &users)
	// if err != nil {
	// 	return err
	// }

	// for _, user := range users {
	// 	// then insert them in the db
	// 	result := db.Create(&user)
	// 	if result.Error != nil {
	// 		return err
	// 	}
	// }

	return err
}

func Shutdown() error {
	// err := db.Close()
	return nil
}
