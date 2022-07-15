package models_test

import (
	"fmt"
	"testing"
	"time"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var (
	resourceID      uuid.UUID = uuid.New()
	resourceWrongID uuid.UUID = uuid.New()
)

func TestResourceModel(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all resources", func(t *testing.T) {
		res, err := models.GetAllResources()
		require.Nil(t, err)
		assert.NotEqual(t, len(res), 0)
	})

	t.Run("Test create resource", func(t *testing.T) {
		syll := models.Syllabus{
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Title:     "Test Title 2",
		}
		_, err := models.CreateSyllabus(&syll) //-- todo bug here there is always an issue with conflicting keys
		require.Nil(t, err)

		res := models.Resource{
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
			Name:       "Test Name 2",
			SyllabusID: syll.ID,
			Syllabus:   &syll,
		}
		r, err := models.CreateResource(&res)
		require.Nil(t, err)
		assert.Equal(t, r.Name, res.Name, "Expected to have equal names, got %v - %v", r.Name, res.Name)
		assert.Equal(t, syll.Title, r.Syllabus.Title, "Expected to have equal titles for parent syllabus, got %v - %v", syll.Title, r.Syllabus.Title)
	})

	t.Run("Test get resource", func(t *testing.T) {
		res, err := models.GetResource(resourceID)
		require.Nil(t, err)
		assert.Equal(t, res.ID, resourceID)
	})

	t.Run("Test get non-existing resource", func(t *testing.T) {
		res, err := models.GetResource(resourceWrongID)
		assert.NotNil(t, err)
		assert.True(t, res.CreatedAt.IsZero())
	})

	t.Run("Test update resource", func(t *testing.T) {
		res := models.Resource{
			UpdatedAt: time.Now(),
			Name:      "Test Name 1 (updated)",
		}
		updated, err := models.UpdateResource(resourceID, &res)
		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())

		assert.Equal(t, updated.Name, res.Name)
		assert.NotEqual(t, updated.CreatedAt, updated.UpdatedAt, "Expected the CreatedAt and the UpdatedAt values to be different")
	})

	t.Run("Test update non-existing resource", func(t *testing.T) {
		res := models.Resource{
			UpdatedAt: time.Now(),
			Name:      "Test Name 1 (updated)",
		}
		updated, err := models.UpdateResource(resourceWrongID, &res)
		assert.NotNil(t, err)
		assert.True(t, updated.CreatedAt.IsZero())
	})

	t.Run("Test delete resource", func(t *testing.T) {
		err := models.DeleteResource(resourceID)
		assert.Nil(t, err)
	})

	t.Run("Test delete wrong resource", func(t *testing.T) {
		err := models.DeleteResource(resourceWrongID)
		fmt.Println(err)
		assert.NotNil(t, err)
	})
}
