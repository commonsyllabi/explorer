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

	searchParams := make(map[string]any, 0)
	searchParams["page"] = 0
	searchParams["languages"] = "%"
	searchParams["keywords"] = "%"
	searchParams["fields"] = "%"
	searchParams["levels"] = "%"
	searchParams["tags"] = "%"

	t.Run("Test get all listed syllabi", func(t *testing.T) {
		syll, err := models.GetSyllabi(searchParams, userID)
		require.Nil(t, err)
		assert.Equal(t, 2, len(syll))
	})

	t.Run("Test get all listed syllabi written in french", func(t *testing.T) {
		searchParams["languages"] = "%(de)%"
		syll, err := models.GetSyllabi(searchParams, userID)
		require.Nil(t, err)
		assert.Equal(t, 2, len(syll))
		searchParams["languages"] = "%"
	})

	t.Run("Test get all listed syllabi with keywords search", func(t *testing.T) {
		searchParams["keywords"] = "%(berlin|architektur)%"
		syll, err := models.GetSyllabi(searchParams, userID)
		require.Nil(t, err)
		assert.Equal(t, 2, len(syll))
		searchParams["keywords"] = "%"
	})

	t.Run("Test get all listed syllabi with tag search", func(t *testing.T) {
		searchParams["tags"] = "%(design)%"
		syll, err := models.GetSyllabi(searchParams, userID)
		require.Nil(t, err)
		assert.Equal(t, 1, len(syll))
		searchParams["tags"] = "%"
	})

	t.Run("Test get all listed syllabi with levels", func(t *testing.T) {
		searchParams["levels"] = "%(2)%"
		syll, err := models.GetSyllabi(searchParams, userID)
		require.Nil(t, err)
		assert.Equal(t, 1, len(syll))
		searchParams["levels"] = "%"
	})

	t.Run("Test get all listed syllabi with fields", func(t *testing.T) {
		searchParams["fields"] = "%(100)%"
		syll, err := models.GetSyllabi(searchParams, userID)
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

	t.Run("Test get syllabus", func(t *testing.T) {
		syll, err := models.GetSyllabus(syllabusID, userID)
		require.Nil(t, err)
		assert.Equal(t, syll.UUID, syllabusID)
		assert.Equal(t, syllabusTitle, syll.Title)
		assert.Equal(t, syllabusUserName, syll.User.Name)
		assert.Equal(t, 1, len(syll.Institutions))
	})

	t.Run("Test get unlisted syllabus with unauthenticated user", func(t *testing.T) {
		_, err := models.GetSyllabus(syllabusUnlistedID, userUnknownID)
		assert.NotNil(t, err)
	})

	t.Run("Test get syllabus by slug", func(t *testing.T) {
		syll, err := models.GetSyllabusBySlug(syllabusSlug, userID)
		require.Nil(t, err)
		assert.Equal(t, syll.UUID, syllabusID)
		assert.Equal(t, syllabusTitle, syll.Title)
		assert.Equal(t, syllabusUserName, syll.User.Name)
		assert.Equal(t, 1, len(syll.Institutions))
	})

	t.Run("Test get non-existing syllabus", func(t *testing.T) {
		syll, err := models.GetSyllabus(syllabusUnknownID, userID)
		assert.NotNil(t, err)
		assert.True(t, syll.CreatedAt.IsZero())
	})

	t.Run("Test update syllabus", func(t *testing.T) {
		var syll models.Syllabus
		updatedTitle := fmt.Sprintf("%s (updated)", syllabusTitle)
		syll.Title = updatedTitle
		updated, err := models.UpdateSyllabus(syllabusID, userID, &syll)

		require.Nil(t, err)
		require.NotZero(t, updated.CreatedAt)

		assert.Equal(t, updatedTitle, syll.Title)
	})

	t.Run("Test update syllabus wrong user", func(t *testing.T) {
		var syll models.Syllabus
		updatedTitle := fmt.Sprintf("%s (updated by someone else)", syllabusTitle)
		syll.Title = updatedTitle
		_, err := models.UpdateSyllabus(syllabusID, userUnknownID, &syll)

		require.NotNil(t, err)
	})

	t.Run("Test update non-existing syllabus", func(t *testing.T) {
		syll := models.Syllabus{
			Title: "Test Title 1 (updated)",
		}
		updated, err := models.UpdateSyllabus(syllabusUnknownID, userID, &syll)
		assert.NotNil(t, err)
		assert.Zero(t, updated.CreatedAt)
	})

	t.Run("Test add attachment to syllabus", func(t *testing.T) {
		updated, err := models.AddAttachmentToSyllabus(syllabusID, attachmentID, userID)
		require.Nil(t, err)
		assert.Equal(t, 3, len(updated.Attachments))
	})

	var newInstID uuid.UUID
	t.Run("Test add institution to syllabus", func(t *testing.T) {
		inst := models.Institution{
			Name:    "Test Uni 2",
			Country: 250,
			Date: models.Date{
				Term: "fall",
				Year: 2020,
			},
		}

		updated, err := models.AddInstitutionToSyllabus(syllabusID, userID, &inst)
		assert.Nil(t, err)
		assert.Equal(t, syllabusID, updated.UUID)
		assert.Equal(t, 1, len(updated.Institutions))
		newInstID = updated.Institutions[0].UUID
	})

	t.Run("Test remove institution from syllabus", func(t *testing.T) {
		updated, err := models.RemoveInstitutionFromSyllabus(syllabusID, newInstID, userID)
		assert.Nil(t, err)
		assert.Equal(t, syllabusID, updated.UUID)
		assert.Equal(t, 0, len(updated.Institutions))
	})

	t.Run("Test remove institution from syllabus wrong syll ID", func(t *testing.T) {
		_, err := models.RemoveInstitutionFromSyllabus(syllabusUnknownID, newInstID, userID)
		assert.NotNil(t, err)
	})

	t.Run("Test remove institution from syllabus wrong inst ID", func(t *testing.T) {
		_, err := models.RemoveInstitutionFromSyllabus(syllabusID, instID, userID)
		assert.NotNil(t, err)
	})

	t.Run("Test delete syllabus", func(t *testing.T) {
		syll, err := models.DeleteSyllabus(syllabusDeleteID, userID)
		assert.NotNil(t, syll)
		assert.Nil(t, err)
	})

	t.Run("Test delete wrong syllabus", func(t *testing.T) {
		syll, err := models.DeleteSyllabus(syllabusUnknownID, userID)
		assert.NotNil(t, err)
		assert.Zero(t, syll)
	})
}
