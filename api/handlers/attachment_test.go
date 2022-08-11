package handlers_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"testing"

	"github.com/commonsyllabi/explorer/api/config"
	"github.com/commonsyllabi/explorer/api/handlers"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAttachmentHandler(t *testing.T) {
	var conf config.Config
	conf.DefaultConf()

	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all attachments", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		handlers.GetAllAttachments(c)
		assert.Equal(t, http.StatusOK, res.Code)

		atts := make([]models.Attachment, 0)
		err := json.Unmarshal(res.Body.Bytes(), &atts)
		require.Nil(t, err)
		assert.Equal(t, 5, len(atts))
	})

	t.Run("Test create attachment with file", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Test Attachment file")
		w.WriteField("desc", "")
		w.WriteField("url", "")

		var fw io.Writer
		file := mustOpen(attachmentFilePath)
		fw, err := w.CreateFormFile("file", file.Name())
		if err != nil {
			t.Error(err)
		}

		if _, err := io.Copy(fw, file); err != nil {
			t.Error(err)
		}
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Set("config", conf)
		c.Request = &http.Request{
			Header: make(http.Header),
		}
		c.Request.URL, _ = url.Parse(fmt.Sprintf("?syllabus_id=%s", syllabusID.String()))

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateAttachment(c)

		assert.Equal(t, http.StatusCreated, res.Code)

		var att models.Attachment
		err = json.Unmarshal(res.Body.Bytes(), &att)
		require.Nil(t, err)
		assert.Equal(t, "Test Attachment file", att.Name)
		assert.Equal(t, "file", att.Type)
		assert.Contains(t, att.URL, filepath.Base(file.Name()))
	})

	t.Run("Test create attachment with URL", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Test Attachment URL")
		w.WriteField("desc", "")
		w.WriteField("url", "http://localhost.test/file")
		w.CreateFormFile("file", "")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Set("config", conf)
		c.Request = &http.Request{
			Header: make(http.Header),
		}
		c.Request.URL, _ = url.Parse(fmt.Sprintf("?syllabus_id=%s", syllabusID.String()))

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateAttachment(c)

		assert.Equal(t, http.StatusCreated, res.Code)
		var att models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &att)
		require.Nil(t, err)
		assert.Equal(t, "Test Attachment URL", att.Name)
		assert.Equal(t, "weblink", att.Type)
	})

	t.Run("Test create attachment malformed input", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Shrt")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Set("config", conf)
		c.Request = &http.Request{
			Header: make(http.Header),
		}
		c.Request.URL, _ = url.Parse(fmt.Sprintf("?syllabus_id=%s", syllabusID.String()))

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
		c.Set("config", conf)
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

		var att models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &att)
		require.Nil(t, err)
		assert.Equal(t, attachmentID, att.UUID)
		assert.Equal(t, "Chair website", att.Name)
		assert.Equal(t, "https://fg.vanr.tu-berlin.de/ungewohnt/", att.URL)
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
		w.WriteField("name", "Shrt")
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
				Value: attachmentDeleteID.String(),
			},
		}

		handlers.DeleteAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var att models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &att)
		require.Nil(t, err)
		assert.Equal(t, attachmentDeleteID, att.UUID)
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

func mustOpen(path string) *os.File {
	r, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	return r
}
