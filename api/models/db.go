package models

import (
	"fmt"
	"path/filepath"
	"runtime"

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

	underlying, _ := db.DB()
	fmt.Printf("%+v", underlying)

	err = db.AutoMigrate(&Resource{})

	// err = runMigrations(url, sslMode)
	// if err != nil {
	// 	zero.Errorf("error running migrations: %v", err)
	// 	log.Fatal(err)
	// }

	// err = runFixtures()
	// if err != nil {
	// 	zero.Errorf("error running fixtures: %v", err)
	// 	return db, err
	// }

	return db, err
}

func runMigrations(url string, sslMode bool) error {

	// if !sslMode {
	// 	url = url + "?sslmode=disable"
	// }

	// migrationsDir := "file://" + Basepath + "/migrations"
	// m, err := migrate.New(migrationsDir, url)
	// if err != nil {
	// 	return err
	// }

	// err = m.Up()
	// if err != nil && err != migrate.ErrNoChange {
	// 	return err
	// }

	// if err == migrate.ErrNoChange {
	// 	zero.Debug("Running migrations with no change")
	// }

	// return err
	return nil
}

func runFixtures() error {
	// fixture := dbfixture.New(db, dbfixture.WithTruncateTables())
	// db.RegisterModel(
	// 	(*Syllabus)(nil),
	// 	(*Resource)(nil),
	// 	(*User)(nil),
	// 	(*Collection)(nil),
	// )

	// ctx := context.Background()
	// _ = fixture.Load(ctx, os.DirFS(Basepath+"/fixtures"), "syllabus.yml", "resource.yml", "user.yml", "collection.yml")
	return nil
}

func Shutdown() error {
	// err := db.Close()
	return nil
}
