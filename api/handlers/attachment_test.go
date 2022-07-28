package handlers_test

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/commonsyllabi/explorer/api/handlers"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAttachmentHandler(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all attachments", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		handlers.GetAllAttachments(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test create attachment", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Test Attachment Handling")
		w.WriteField("type", "weblink")
		w.WriteField("url", "http://test.com/attachment")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}
		c.Set("syllabus_id", syllabusID.String())

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateAttachment(c)

		assert.Equal(t, http.StatusCreated, res.Code)
		//-- todo check for value
	})

	t.Run("Test create attachment malformed input", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Short")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateAttachment(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test create attachment wrong field", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("wrong-field", "Updated Name")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateAttachment(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get attachment", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: attachmentID.String(),
			},
		}

		handlers.GetAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test get attachment malformed ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: "wrong",
			},
		}

		handlers.GetAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get attachment non-existant ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: attachmentNonExistingID.String(),
			},
		}

		handlers.GetAttachment(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update attachment", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Updated Name")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "PATCH"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: attachmentID.String(),
			},
		}

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var att models.Attachment
		err := c.Bind(&att)
		require.Nil(t, err)
		assert.Equal(t, "Updated Name", att.Name)
	})

	t.Run("Test update attachment malformed ID", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Updated Name")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "PATCH"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: "wrong",
			},
		}

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update attachment malformed field", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("malicious-field", "Short")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "PATCH"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: attachmentID.String(),
			},
		}

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update attachment non-existent ID", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Updated Name")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "PATCH"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: attachmentNonExistingID.String(),
			},
		}

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update attachment malformed name", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Short")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "PATCH"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: attachmentID.String(),
			},
		}

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete attachment", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: attachmentID.String(),
			},
		}

		handlers.DeleteAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test delete malformed attachment", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: "wrong",
			},
		}

		handlers.DeleteAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete non-existant attachment", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: attachmentNonExistingID.String(),
			},
		}

		handlers.DeleteAttachment(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

}
