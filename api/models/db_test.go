package models_test

import (
	"os"
	"testing"
	"time"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var databaseTestURL string

func TestInitDB(t *testing.T) {
	time.Sleep(1 * time.Second)
	databaseTestURL = os.Getenv("DATABASE_TEST_URL")
	if databaseTestURL == "" {
		databaseTestURL = "postgres://cosyl:cosyl@localhost:5432/explorer-test"
	}
	_, err := models.InitDB(databaseTestURL)
	assert.Nil(t, err)
}

func setup(t *testing.T) func(t *testing.T) {
	mustSeedDB(t)
	return func(t *testing.T) {
		models.RemoveFixtures(t)
	}
}

//-- todo here we should check whether the db is already initialized or not
func mustSeedDB(t *testing.T) {
	databaseTestURL = os.Getenv("DATABASE_TEST_URL")
	if databaseTestURL == "" {
		databaseTestURL = "postgres://cosyl:cosyl@localhost:5432/explorer-test"
	}
	_, err := models.InitDB(databaseTestURL)

	require.Nil(t, err)
}
