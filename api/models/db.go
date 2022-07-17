package models

import (
	"context"
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dbfixture"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

var (
	db         *bun.DB
	_, b, _, _ = runtime.Caller(0)
	Basepath   = filepath.Dir(b)
)

func InitDB(url string) (*bun.DB, error) {
	zero.Infof("connecting: %s", url) //-- todo this should not be logged
	sslMode := false
	if strings.HasSuffix(url, "sslmode=require") {
		sslMode = true
	}

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(url), pgdriver.WithInsecure(!sslMode)))

	db = bun.NewDB(sqldb, pgdialect.New())

	err := db.Ping()
	if err != nil {
		return db, err
	}

	err = runMigrations(url, sslMode)
	if err != nil {
		zero.Errorf("error running migrations: %v", err)
		log.Fatal(err)
	}

	err = runFixtures()
	if err != nil {
		zero.Errorf("error running fixtures: %v", err)
		return db, err
	}

	return db, err
}

func InitTestDB(url string) (*bun.DB, error) {
	zero.Infof("connecting: %s", url) //-- todo this should not be logged
	sslMode := false
	if strings.HasSuffix(url, "sslmode=require") {
		sslMode = true
	}

	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(url), pgdriver.WithInsecure(!sslMode)))

	// mockdb, _, err := sqlmock.New()
	// if err != nil {
	// 	panic(err)
	// }

	db = bun.NewDB(sqldb, pgdialect.New())

	err := db.Ping()
	if err != nil {
		return db, err
	}

	err = runMigrations(url, sslMode)
	if err != nil {
		zero.Errorf("error running migrations: %v", err)
		log.Fatal(err)
	}

	err = runFixtures()
	if err != nil {
		zero.Errorf("error running fixtures: %v", err)
		return db, err
	}

	return db, err
}

func runMigrations(url string, sslMode bool) error {
	if !sslMode {
		url = url + "?sslmode=disable"
	}

	migrationsDir := "file://" + Basepath + "/migrations"
	m, err := migrate.New(migrationsDir, url)
	if err != nil {
		return err
	}

	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		return err
	}

	if err == migrate.ErrNoChange {
		zero.Debug("Running migrations with no change")
	}

	return nil
}

func runFixtures() error {
	fixture := dbfixture.New(db, dbfixture.WithTruncateTables())
	db.RegisterModel(
		(*Syllabus)(nil),
		(*Resource)(nil),
		(*User)(nil),
		(*Collection)(nil),
	)

	ctx := context.Background()
	_ = fixture.Load(ctx, os.DirFS(Basepath+"/fixtures"), "syllabus.yml", "resource.yml", "user.yml", "collection.yml")
	return nil
}

func Shutdown() error {
	err := db.Close()
	return err
}
