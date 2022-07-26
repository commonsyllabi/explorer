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

	t.Run("Test get all collections", func(t *testing.T) {
		res, err := models.GetAllCollections()
		require.Nil(t, err)
		assert.NotEqual(t, len(res), 0)
	})

	t.Run("Test create collection", func(t *testing.T) {
		user := models.User{
			Email:    "test@collection-create.com",
			Password: []byte("12345678"),
		}
		user, err := models.CreateUser(&user)
		require.Nil(t, err)

		res := models.Collection{
			Name: "Test Name 2",
		}
		r, err := models.CreateCollection(user.UUID, &res)
		require.Nil(t, err)
		assert.Equal(t, r.Name, res.Name, "Expected to have equal names, got %v - %v", r.Name, res.Name)
		// assert.Equal(t, user.Email, r.User.Email, "Expected to have equal titles for parent syllabus, got %v - %v", user.Email, r.User.Email)
	})

	t.Run("Test get collection", func(t *testing.T) {
		coll, err := models.GetCollection(collectionID)
		require.Nil(t, err)
		assert.Equal(t, coll.UUID, collectionID)
	})

	t.Run("Test get non-existing collection", func(t *testing.T) {
		res, err := models.GetCollection(collectionNonExistingID)
		assert.NotNil(t, err)
		assert.True(t, res.CreatedAt.IsZero())
	})

	t.Run("Test update collection", func(t *testing.T) {
		var coll models.Collection
		coll.Name = "updated"
		updated, err := models.UpdateCollection(collectionID, &coll)

		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())

		assert.Equal(t, updated.Name, coll.Name)
		assert.NotEqual(t, updated.CreatedAt, updated.UpdatedAt, "Expected the CreatedAt and the UpdatedAt values to be different")
	})

	t.Run("Test update non-existing collection", func(t *testing.T) {
		res := models.Collection{
			Name: "Test Name 1 (updated)",
		}
		updated, err := models.UpdateCollection(collectionNonExistingID, &res)
		assert.NotNil(t, err)
		assert.True(t, updated.CreatedAt.IsZero())
	})

	t.Run("Test delete collection", func(t *testing.T) {
		res, err := models.DeleteCollection(collectionDeleteID)
		assert.NotNil(t, res)
		assert.Nil(t, err)
	})

	t.Run("Test delete wrong collection", func(t *testing.T) {
		res, err := models.DeleteCollection(collectionNonExistingID)
		assert.Zero(t, res)
		fmt.Println(err)
		assert.NotNil(t, err)
	})
}
