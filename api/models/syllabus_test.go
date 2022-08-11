package models_test

import (
	"fmt"
	"testing"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSyllabusModel(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	searchParams := make(map[string]string, 0)
	searchParams["languages"] = "%"
	searchParams["keywords"] = "%"
	searchParams["fields"] = "%"
	searchParams["levels"] = "%"
	searchParams["tags"] = "%"

	t.Run("Test get all syllabi", func(t *testing.T) {
		syll, err := models.GetSyllabi(searchParams)
		require.Nil(t, err)
		assert.Equal(t, 4, len(syll))
	})

	t.Run("Test get all syllabi written in french", func(t *testing.T) {
		searchParams["languages"] = "%(fr)%"
		syll, err := models.GetSyllabi(searchParams)
		require.Nil(t, err)
		assert.Equal(t, 1, len(syll))
		searchParams["languages"] = "%"
	})

	t.Run("Test get all syllabi with keywords search", func(t *testing.T) {
		searchParams["keywords"] = "%(culture|design)%"
		syll, err := models.GetSyllabi(searchParams)
		require.Nil(t, err)
		assert.Equal(t, 2, len(syll))
		searchParams["keywords"] = "%"
	})

	t.Run("Test get all syllabi with tag search", func(t *testing.T) {
		searchParams["tags"] = "%(design)%"
		syll, err := models.GetSyllabi(searchParams)
		require.Nil(t, err)
		assert.Equal(t, 2, len(syll))
		searchParams["tags"] = "%"
	})

	t.Run("Test get all syllabi with levels", func(t *testing.T) {
		searchParams["levels"] = "%(2)%"
		syll, err := models.GetSyllabi(searchParams)
		require.Nil(t, err)
		assert.Equal(t, 1, len(syll))
		searchParams["levels"] = "%"
	})

	t.Run("Test get all syllabi with fields", func(t *testing.T) {
		searchParams["fields"] = "%(100)%"
		syll, err := models.GetSyllabi(searchParams)
		require.Nil(t, err)
		assert.Equal(t, 1, len(syll))
		searchParams["fields"] = "%"
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
		assert.Equal(t, 1, len(syll.Institutions))
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

	t.Run("Test add attachment to syllabus", func(t *testing.T) {
		updated, err := models.AddAttachmentToSyllabus(syllabusID, attachmentID)
		require.Nil(t, err)
		assert.Equal(t, 3, len(updated.Attachments))
	})

	var newInstID uuid.UUID
	t.Run("Test add institution to syllabus", func(t *testing.T) {
		inst := models.Institution{
			Name: "Test Uni 2",
			Date: models.Date{
				Term: "fall",
				Year: 2020,
			},
		}

		updated, err := models.AddInstitutionToSyllabus(syllabusID, &inst)
		assert.Nil(t, err)
		assert.Equal(t, syllabusID, updated.UUID)
		assert.Equal(t, 1, len(updated.Institutions))
		newInstID = updated.Institutions[0].UUID
	})

	t.Run("Test remove institution from syllabus", func(t *testing.T) {
		updated, err := models.RemoveInstitutionFromSyllabus(syllabusID, newInstID)
		assert.Nil(t, err)
		assert.Equal(t, syllabusID, updated.UUID)
		assert.Equal(t, 0, len(updated.Institutions))
	})

	t.Run("Test remove institution from syllabus wrong syll ID", func(t *testing.T) {
		_, err := models.RemoveInstitutionFromSyllabus(syllabusNonExistingID, newInstID)
		assert.NotNil(t, err)
	})

	t.Run("Test remove institution from syllabus wrong inst ID", func(t *testing.T) {
		_, err := models.RemoveInstitutionFromSyllabus(syllabusID, instID)
		assert.NotNil(t, err)
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
