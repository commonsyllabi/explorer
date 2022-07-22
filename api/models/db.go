package models

import (
	"log"
	"path/filepath"
	"runtime"

	zero "github.com/commonsyllabi/explorer/api/logger"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

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

	err = db.AutoMigrate(&User{}, &Collection{}, &Syllabus{}, &Resource{})
	if err != nil {
		zero.Errorf("error running migrations: %v", err)
		log.Fatal(err)
	}

	// err = runFixtures()
	// if err != nil {
	// 	zero.Errorf("error running fixtures: %v", err)
	// 	return db, err
	// }

	return db, err
}

func runFixtures() error {
	var err error
	// fixture := dbfixture.New(db, dbfixture.WithTruncateTables())
	// db.RegisterModel(
	// 	(*Syllabus)(nil),
	// 	(*Resource)(nil),
	// 	(*User)(nil),
	// 	(*Collection)(nil),
	// )

	// ctx := context.Background()
	// _ = fixture.Load(ctx, os.DirFS(Basepath+"/fixtures"), "syllabus.yml", "resource.yml", "user.yml", "collection.yml")
	return err
}

func Shutdown() error {
	// err := db.Close()
	return nil
}
