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
	db, err := gorm.Open(postgres.Open(url), &gorm.Config{})
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

	bytes, err = ioutil.ReadFile(filepath.Join(Basepath, "fixtures", "syllabus.yml"))
	if err != nil {
		return err
	}

	syllabi := make([]Syllabus, 0)
	err = yaml.Unmarshal(bytes, &syllabi)
	if err != nil {
		return err
	}

	bytes, err = ioutil.ReadFile(filepath.Join(Basepath, "fixtures", "collection.yml"))
	if err != nil {
		return err
	}

	collections := make([]Collection, 0)
	err = yaml.Unmarshal(bytes, &collections)
	if err != nil {
		return err
	}

	bytes, err = ioutil.ReadFile(filepath.Join(Basepath, "fixtures", "resource.yml"))
	if err != nil {
		return err
	}

	resources := make([]Resource, 0)
	err = yaml.Unmarshal(bytes, &resources)
	if err != nil {
		return err
	}

	for _, user := range users {
		result := _db.Create(&user)
		if result.Error != nil {
			return err
		}
	}

	// _db.Model(&users[0]).Association("Syllabi").Append(&syllabi[0])
	// _db.First(&users[0])
	// fmt.Printf("user has %d syllabi\n", len(users[0].Syllabi))

	return err
}

func Shutdown() error {
	// err := db.Close()
	return nil
}
