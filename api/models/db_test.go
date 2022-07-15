package models_test

import (
	"os"
	"testing"
	"time"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var (
	databaseTestURL       string = "postgres://postgres:postgres@localhost:5432/explorer-test"
	syllabusID            uuid.UUID
	syllabusNonExistingID uuid.UUID

	collectionID            uuid.UUID
	collectionNonExistingID uuid.UUID

	resourceID            uuid.UUID
	resourceNonExistingID uuid.UUID

	userID            uuid.UUID
	userNonExistentID uuid.UUID
)

func TestInitDB(t *testing.T) {
	time.Sleep(1 * time.Second)
	databaseTestURL = os.Getenv("DATABASE_TEST_URL")
	if databaseTestURL == "" {
		databaseTestURL = "postgres://postgres:postgres@localhost:5432/explorer-test"
	}
	_, err := models.InitDB(databaseTestURL)
	assert.Nil(t, err)
}

func setup(t *testing.T) func(t *testing.T) {
	syllabusID = uuid.MustParse("46de6a2b-aacb-4c24-b1e1-3495821f846a")
	syllabusNonExistingID = uuid.New()

	collectionID = uuid.MustParse("b9e4c3ed-ac4f-4e44-bb43-5123b7b6d7a7")
	collectionNonExistingID = uuid.New()

	resourceID = uuid.MustParse("c55f0baf-12b8-4bdb-b5e6-2280bff8ab21")
	resourceNonExistingID = uuid.New()

	userID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a8")
	userNonExistentID = uuid.New()

	mustSeedDB(t)
	return func(t *testing.T) {
		models.RemoveFixtures(t)
	}
}

//-- todo here we should check whether the db is already initialized or not
func mustSeedDB(t *testing.T) {
	databaseTestURL = os.Getenv("DATABASE_TEST_URL")
	if databaseTestURL == "" {
		databaseTestURL = "postgres://postgres:postgres@localhost:5432/explorer-test"
	}
	_, err := models.InitDB(databaseTestURL)

	require.Nil(t, err)
}
