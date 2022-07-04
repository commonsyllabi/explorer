package models

import (
	"context"
	"database/sql"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	zero "github.com/commonsyllabi/explorer/logger"
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

	err = RunFixtures()
	if err != nil {
		zero.Errorf("error running fixtures: %v", err)
		log.Fatal(err)
	}

	return db, err
}

func runMigrations(url string, sslMode bool) error {
	if !sslMode {
		url = url + "?sslmode=disable"
	}

	migrationsDir := "file://" + Basepath + "/migrations"
	if os.Getenv("TEST") == "true" {
		migrationsDir = "file:///app/migrations"
	}

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

func RunFixtures() error {

	fixture := dbfixture.New(db, dbfixture.WithTruncateTables())

	db.RegisterModel(
		(*Syllabus)(nil),
		(*Resource)(nil),
		(*User)(nil),
		(*Collection)(nil),
	)

	ctx := context.Background()
	// dir := "file://" + Basepath + "/fixtures"
	err := fixture.Load(ctx, os.DirFS("/home/pierre/code/commonsyllabi/explorer/api/models/fixtures"), "syllabus.yml", "resource.yml", "user.yml", "collection.yml")

	return err
}

func RemoveFixtures(t *testing.T) {
	ctx := context.Background()
	db.NewTruncateTable().Model((*Syllabus)(nil)).Cascade().Exec(ctx)
	db.NewTruncateTable().Model((*Resource)(nil)).Cascade().Exec(ctx)
	db.NewTruncateTable().Model((*User)(nil)).Cascade().Exec(ctx)
	db.NewTruncateTable().Model((*Collection)(nil)).Cascade().Exec(ctx)
}

func Shutdown() error {
	err := db.Close()
	return err
}
