package models_test

import (
	"fmt"
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
		assert.Equal(t, len(res), 2)
	})

	t.Run("Test create attachment", func(t *testing.T) {
		syll := models.Syllabus{
			Title: "Test Title 2",
		}
		result, err := models.CreateSyllabus(userID, &syll)
		require.Nil(t, err)

		att := models.Attachment{
			Name: "Test Name 2",
		}
		created, err := models.CreateAttachment(result.UUID, &att)
		require.Nil(t, err)
		assert.Equal(t, att.Name, created.Name)
		assert.Equal(t, syll.Title, created.Syllabus.Title)
	})

	t.Run("Test get attachment", func(t *testing.T) {
		att, err := models.GetAttachment(attachmentID)
		require.Nil(t, err)
		assert.Equal(t, att.UUID, attachmentID)
		assert.Equal(t, attachmentName, att.Name)
		assert.Equal(t, attachmentURL, att.URL)
	})

	t.Run("Test get non-existing attachment", func(t *testing.T) {
		res, err := models.GetAttachment(attachmentNonExistingID)
		assert.NotNil(t, err)
		assert.True(t, res.CreatedAt.IsZero())
	})

	t.Run("Test update attachment", func(t *testing.T) {
		var att models.Attachment
		updatedName := fmt.Sprintf("%v (updated)", attachmentName)
		att.Name = updatedName
		updated, err := models.UpdateAttachment(attachmentID, &att)
		require.Nil(t, err)
		require.False(t, updated.CreatedAt.IsZero())

		assert.Equal(t, updatedName, updated.Name)
		assert.Equal(t, attachmentURL, updated.URL)
		assert.NotEqual(t, updated.CreatedAt, updated.UpdatedAt)
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