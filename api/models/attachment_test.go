package models_test

import (
	"testing"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAttachmentModel(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all attachments", func(t *testing.T) {
		res, err := models.GetAllAttachments()
		require.Nil(t, err)
		assert.NotEqual(t, len(res), 0)
	})

	t.Run("Test create attachment", func(t *testing.T) {
		syll := models.Syllabus{
			Title: "Test Title 2",
		}
		result, err := models.CreateSyllabus(userID, &syll)
		require.Nil(t, err)
		t.Log(result.UUID)
		att := models.Attachment{
			Name: "Test Name 2",
		}
		created, err := models.CreateAttachment(result.UUID, &att)
		require.Nil(t, err)
		assert.Equal(t, att.Name, created.Name, "Expected to have equal names, got %v - %v", att.Name, created.Name)
		assert.Equal(t, syll.Title, created.Syllabus.Title, "Expected to have equal titles for parent syllabus, got %v - %v", syll.Title, created.Syllabus.Title)
	})

	t.Run("Test get attachment", func(t *testing.T) {
		res, err := models.GetAttachment(attachmentID)
		require.Nil(t, err)
		assert.Equal(t, res.UUID, attachmentID)
		// todo test for value
	})

	t.Run("Test get non-existing attachment", func(t *testing.T) {
		res, err := models.GetAttachment(attachmentNonExistingID)
		assert.NotNil(t, err)
		assert.True(t, res.CreatedAt.IsZero())
	})

	t.Run("Test update attachment", func(t *testing.T) {
		var att models.Attachment
		att.Name = "Test Name 1 (updated)"
		updated, err := models.UpdateAttachment(attachmentID, &att)
		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())

		assert.Equal(t, updated.Name, att.Name)
		assert.NotEqual(t, updated.CreatedAt, updated.UpdatedAt, "Expected the CreatedAt and the UpdatedAt values to be different")
		// todo test for value
	})

	t.Run("Test update non-existing attachment", func(t *testing.T) {
		res := models.Attachment{
			Name: "Test Name 1 (updated)",
		}
		updated, err := models.UpdateAttachment(attachmentNonExistingID, &res)
		assert.NotNil(t, err)
		assert.True(t, updated.CreatedAt.IsZero())
	})

	t.Run("Test delete attachment", func(t *testing.T) {
		res, err := models.DeleteAttachment(attachmentDeleteID)
		assert.NotNil(t, res)
		assert.Nil(t, err)
	})

	t.Run("Test delete wrong attachment", func(t *testing.T) {
		res, err := models.DeleteAttachment(attachmentNonExistingID)
		assert.Zero(t, res)
		assert.NotNil(t, err)
	})
}
