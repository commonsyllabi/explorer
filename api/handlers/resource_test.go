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

func TestResourceHandler(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all resources", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		handlers.GetAllResources(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test create resource", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Test Resource Handling")
		w.WriteField("type", "weblink")
		w.WriteField("url", "http://test.com/resource")
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

		handlers.CreateResource(c)

		assert.Equal(t, http.StatusCreated, res.Code)
	})

	t.Run("Test create resource malformed input", func(t *testing.T) {
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

		handlers.CreateResource(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test create resource wrong field", func(t *testing.T) {
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

		handlers.CreateResource(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get resource", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: resourceID.String(),
			},
		}

		handlers.GetResource(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test get resource malformed ID", func(t *testing.T) {
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

		handlers.GetResource(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get resource non-existant ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: resourceNonExistingID.String(),
			},
		}

		handlers.GetResource(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update resource", func(t *testing.T) {
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
				Value: resourceID.String(),
			},
		}

		handlers.UpdateResource(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var resource models.Resource
		err := c.Bind(&resource)
		require.Nil(t, err)
		assert.Equal(t, "Updated Name", resource.Name)
	})

	t.Run("Test update resource malformed ID", func(t *testing.T) {
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

		handlers.UpdateResource(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update resource malformed field", func(t *testing.T) {
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
				Value: resourceID.String(),
			},
		}

		handlers.UpdateResource(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update resource non-existent ID", func(t *testing.T) {
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
				Value: resourceNonExistingID.String(),
			},
		}

		handlers.UpdateResource(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update resource malformed name", func(t *testing.T) {
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
				Value: resourceID.String(),
			},
		}

		handlers.UpdateResource(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete resource", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: resourceID.String(),
			},
		}

		handlers.DeleteResource(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test delete malformed resource", func(t *testing.T) {
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

		handlers.DeleteResource(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete non-existant resource", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: resourceNonExistingID.String(),
			},
		}

		handlers.DeleteResource(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

}
