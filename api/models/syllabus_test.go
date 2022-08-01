package models_test

import (
	"fmt"
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
		assert.Equal(t, len(syll), 3)
	})

	t.Run("Test create bare syllabus", func(t *testing.T) {
		syll := models.Syllabus{
			Title: "Test Title 2",
		}
		result, err := models.CreateSyllabus(userID, &syll)
		require.Nil(t, err)
		assert.Equal(t, syll.Title, result.Title)
		assert.NotZero(t, result.CreatedAt)
	})

	t.Run("Test create syllabus with attachments", func(t *testing.T) {
		attachments := make([]models.Attachment, 3)
		syll := models.Syllabus{
			Title:       "Test Title with Attachments",
			Attachments: attachments,
		}
		_, err := models.CreateSyllabus(userID, &syll)
		require.Nil(t, err)
		t.Skip("TODO -- issue with creating attachments as nested structs")
		// assert.Equal(t, len(syll.Attachments), len(result.Attachments))
	})

	t.Run("Test get syllabus", func(t *testing.T) {
		syll, err := models.GetSyllabus(syllabusID)
		require.Nil(t, err)
		assert.Equal(t, syll.UUID, syllabusID)
		assert.Equal(t, syllabusTitle, syll.Title)
		assert.Equal(t, syllabusUserName, syll.User.Name)
	})

	t.Run("Test get non-existing syllabus", func(t *testing.T) {
		syll, err := models.GetSyllabus(syllabusNonExistingID)
		assert.NotNil(t, err)
		assert.True(t, syll.CreatedAt.IsZero())
	})

	t.Run("Test update syllabus", func(t *testing.T) {
		var syll models.Syllabus
		updatedTitle := fmt.Sprintf("%s (updated)", syllabusTitle)
		syll.Title = updatedTitle
		updated, err := models.UpdateSyllabus(syllabusID, &syll)

		require.Nil(t, err)
		require.NotZero(t, updated.CreatedAt)

		assert.Equal(t, updatedTitle, syll.Title)
	})

	t.Run("Test update non-existing syllabus", func(t *testing.T) {
		syll := models.Syllabus{
			Title: "Test Title 1 (updated)",
		}
		updated, err := models.UpdateSyllabus(syllabusNonExistingID, &syll)
		assert.NotNil(t, err)
		assert.Zero(t, updated.CreatedAt)
	})

	t.Run("Test delete syllabus", func(t *testing.T) {
		syll, err := models.DeleteSyllabus(syllabusDeleteID)
		assert.NotNil(t, syll)
		assert.Nil(t, err)
	})

	t.Run("Test delete wrong syllabus", func(t *testing.T) {
		syll, err := models.DeleteSyllabus(syllabusNonExistingID)
		assert.NotNil(t, err)
		assert.Zero(t, syll)
	})
}
