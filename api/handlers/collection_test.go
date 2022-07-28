package handlers_test

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"encoding/json"

	"github.com/commonsyllabi/explorer/api/handlers"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCollectionHandler(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all collections", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		handlers.GetAllCollections(c)
		assert.Equal(t, http.StatusOK, res.Code)

		colls := make([]models.Collection, 0)
		err := json.Unmarshal(res.Body.Bytes(), &colls)
		require.Nil(t, err)
	})

	t.Run("Test create collection", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Test Collection Handling")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateCollection(c)

		assert.Equal(t, http.StatusCreated, res.Code)
	})

	t.Run("Test create collection malformed input", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Test")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateCollection(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get collection", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: collectionID.String(),
			},
		}

		handlers.GetCollection(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var coll models.Collection
		err := json.Unmarshal(res.Body.Bytes(), &coll)
		require.Nil(t, err)
		assert.Equal(t, 1, len(coll.Syllabi))
	})

	t.Run("Test get collection non-existent ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: collectionNonExistingID.String(),
			},
		}

		handlers.GetCollection(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test get collection malformed ID", func(t *testing.T) {
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

		handlers.GetCollection(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update collection", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Updated")
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
				Value: collectionID.String(),
			},
		}

		handlers.UpdateCollection(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var coll models.Collection
		err := json.Unmarshal(res.Body.Bytes(), &coll)
		require.Nil(t, err)
		assert.Equal(t, "Updated", coll.Name)
		assert.NotZero(t, coll.UUID)
	})

	t.Run("Test update collection non-existant ID", func(t *testing.T) {
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
				Value: collectionNonExistingID.String(),
			},
		}

		handlers.UpdateCollection(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update collection malformed ID", func(t *testing.T) {
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

		handlers.UpdateCollection(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update collection wrong field", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("name", "Updated Name")
		w.WriteField("wrong-field", "mailicious")
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

		handlers.UpdateCollection(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test add syllabus to collection", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("syllabus_id", syllabusID.String())
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
				Value: collectionID.String(),
			},
		}

		handlers.AddCollectionSyllabus(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var coll models.Collection
		err := json.Unmarshal(res.Body.Bytes(), &coll)
		require.Nil(t, err)
		assert.Equal(t, 1, len(coll.Syllabi))
	})

	t.Run("Test get all syllabi from collection", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: collectionID.String(),
			},
		}

		handlers.GetCollectionSyllabi(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test get syllabus from collection", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: collectionID.String(),
			},
			{
				Key:   "syll_id",
				Value: syllabusID.String(),
			},
		}

		handlers.GetCollectionSyllabus(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test remove syllabus from collection", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: collectionID.String(),
			},
			{
				Key:   "syll_id",
				Value: syllabusID.String(),
			},
		}

		handlers.RemoveCollectionSyllabus(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		assert.Equal(t, syllabusID, syll.UUID)
	})

	t.Run("Test delete collection", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: collectionDeleteID.String(),
			},
		}

		handlers.DeleteCollection(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test delete collection non-existant ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: collectionNonExistingID.String(),
			},
		}

		handlers.DeleteCollection(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test delete collection wrong input", func(t *testing.T) {
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

		handlers.DeleteCollection(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})
}
