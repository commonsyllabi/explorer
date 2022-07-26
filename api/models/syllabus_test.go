package models_test

import (
	"testing"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSyllabusModel(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all syllabi", func(t *testing.T) {
		syll, err := models.GetAllSyllabi()
		require.Nil(t, err)
		assert.NotEqual(t, len(syll), 0)
	})

	t.Run("Test create bare syllabus", func(t *testing.T) {
		syll := models.Syllabus{
			Title: "Test Title 2",
		}
		_, err := models.CreateSyllabus(userID, &syll)
		assert.Nil(t, err)
	})

	t.Run("Test create syllabus with resources", func(t *testing.T) {
		resources := make([]models.Resource, 3)
		syll := models.Syllabus{
			Title:     "Test Title with Resources",
			Resources: resources,
		}
		_, err := models.CreateSyllabus(userID, &syll)
		assert.Nil(t, err)
		assert.Equal(t, len(syll.Resources), len(resources), "Expected the created syllabus to have %d resources, got %d", len(resources), len(syll.Resources))
	})

	t.Run("Test get syllabus", func(t *testing.T) {
		syll, err := models.GetSyllabus(syllabusID)
		require.Nil(t, err)
		assert.Equal(t, syll.UUID, syllabusID)
	})

	t.Run("Test get non-existing syllabus", func(t *testing.T) {
		syll, err := models.GetSyllabus(syllabusNonExistingID)
		assert.NotNil(t, err)
		assert.True(t, syll.CreatedAt.IsZero())
	})

	t.Run("Test update syllabus", func(t *testing.T) {
		var syll models.Syllabus
		syll.Title = "Test Title 1 (updated)"
		updated, err := models.UpdateSyllabus(syllabusID, &syll)

		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())

		assert.Equal(t, updated.Title, syll.Title)
	})

	t.Run("Test update non-existing syllabus", func(t *testing.T) {
		syll := models.Syllabus{
			Title: "Test Title 1 (updated)",
		}
		updated, err := models.UpdateSyllabus(syllabusNonExistingID, &syll)
		assert.NotNil(t, err)
		assert.True(t, updated.CreatedAt.IsZero())
	})

	t.Run("Test delete syllabus", func(t *testing.T) {
		syll, err := models.DeleteSyllabus(syllabusDeleteID)
		assert.NotNil(t, syll)
		assert.Nil(t, err)
	})

	t.Run("Test delete wrong syllabus", func(t *testing.T) {
		syll, err := models.DeleteSyllabus(syllabusNonExistingID)
		assert.Zero(t, syll)
		assert.NotNil(t, err)
	})
}
