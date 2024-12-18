package models_test

import (
	"fmt"
	"testing"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCollectionModel(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all listed and owned collections", func(t *testing.T) {
		res, err := models.GetAllCollections(userID)
		require.Nil(t, err)
		assert.Equal(t, len(res), 3)
	})

	t.Run("Test create collection", func(t *testing.T) {
		user := models.User{
			Email:    "test@collection-create.com",
			Password: []byte("12345678"),
		}
		user, err := models.CreateUser(&user)
		require.Nil(t, err)

		coll := models.Collection{
			Name: "Test Name 2",
		}
		result, err := models.CreateCollection(&coll, user.UUID)
		require.Nil(t, err)

		assert.Equal(t, coll.Name, result.Name)
		assert.NotZero(t, coll.CreatedAt)
		assert.Equal(t, user.Email, result.User.Email)
	})

	t.Run("Test get collection", func(t *testing.T) {
		coll, err := models.GetCollection(collectionID, userID)
		require.Nil(t, err)
		assert.Equal(t, coll.UUID, collectionID)
		assert.Equal(t, collectionName, coll.Name)
		assert.Equal(t, 1, len(coll.Syllabi))
	})

	t.Run("Test get collection by slug", func(t *testing.T) {
		coll, err := models.GetCollectionBySlug(collectionSlug, userID)
		require.Nil(t, err)
		assert.Equal(t, coll.UUID, collectionID)
		assert.Equal(t, collectionName, coll.Name)
		assert.Equal(t, 1, len(coll.Syllabi))
	})

	t.Run("Test get non-existing collection", func(t *testing.T) {
		res, err := models.GetCollection(collectionUnknownID, userID)
		assert.NotNil(t, err)
		assert.True(t, res.CreatedAt.IsZero())
	})

	t.Run("Test update collection", func(t *testing.T) {
		var coll models.Collection
		updatedName := fmt.Sprintf("%s (updated)", collectionName)
		coll.Name = updatedName
		updated, err := models.UpdateCollection(collectionID, userID, &coll)

		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())

		assert.Equal(t, updatedName, coll.Name)
		assert.NotEqual(t, updated.CreatedAt, updated.UpdatedAt)
		assert.NotNil(t, updated.UserUUID)
	})

	t.Run("Test update non-existing collection", func(t *testing.T) {
		coll := models.Collection{
			Name: "Test Name 1 (updated)",
		}
		updated, err := models.UpdateCollection(collectionUnknownID, userID, &coll)
		assert.NotNil(t, err)
		assert.True(t, updated.CreatedAt.IsZero())
	})

	t.Run("Test add syllabus to collection", func(t *testing.T) {
		updated, err := models.AddSyllabusToCollection(collectionID, syllabusDeleteID, userID)
		assert.Nil(t, err)
		assert.Equal(t, 2, len(updated.Syllabi))
	})

	t.Run("Test remove syllabus from collection", func(t *testing.T) {
		updated, err := models.RemoveCollectionSyllabus(collectionID, syllabusDeleteID, userID)
		assert.Nil(t, err)
		assert.Equal(t, 0, len(updated.Syllabi))
	})

	t.Run("Test delete collection", func(t *testing.T) {
		coll, err := models.DeleteCollection(collectionDeleteID, userID)
		assert.NotNil(t, coll)
		assert.Nil(t, err)
	})

	t.Run("Test delete wrong collection", func(t *testing.T) {
		coll, err := models.DeleteCollection(collectionUnknownID, userID)
		assert.Zero(t, coll)
		assert.NotNil(t, err)
	})
}
