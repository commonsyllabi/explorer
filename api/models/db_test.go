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
	syllabusTitle         string
	syllabusUserName      string
	syllabusDeleteID      uuid.UUID
	syllabusNonExistingID uuid.UUID

	collectionID            uuid.UUID
	collectionName          string
	collectionDeleteID      uuid.UUID
	collectionNonExistingID uuid.UUID

	attachmentID            uuid.UUID
	attachmentName          string
	attachmentURL           string
	attachmentDeleteID      uuid.UUID
	attachmentNonExistingID uuid.UUID

	userID            uuid.UUID
	userDeleteID      uuid.UUID
	userNonExistentID uuid.UUID
	userEmail         string
	userName          string
	userDeleteName    string
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
	syllabusTitle = "User-created 1"
	syllabusUserName = "full user 1"
	syllabusDeleteID = uuid.MustParse("46de6a2b-aacb-4c24-b1e1-3495821f8469")
	syllabusNonExistingID = uuid.New()

	collectionID = uuid.MustParse("b9e4c3ed-ac4f-4e44-bb43-5123b7b6d7a9")
	collectionName = "Fixture Collection"
	collectionDeleteID = uuid.MustParse("b9e4c3ed-ac4f-4e44-bb43-5123b7b6d7a7")
	collectionNonExistingID = uuid.New()

	attachmentID = uuid.MustParse("c55f0baf-12b8-4bdb-b5e6-2280bff8ab21")
	attachmentName = "Syllabus-owned Attachment 1"
	attachmentURL = "http://localhost/file1.jpg"
	attachmentDeleteID = uuid.MustParse("c55f0baf-12b8-4bdb-b5e6-2280bff8ab30")
	attachmentNonExistingID = uuid.New()

	userID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a8")
	userDeleteID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a9")
	userNonExistentID = uuid.New()
	userEmail = "one@raz.com"
	userName = "full user 1"
	userDeleteName = "user to be deleted"

	mustSeedDB(t)
	return func(t *testing.T) {

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
