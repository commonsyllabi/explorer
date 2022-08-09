package handlers_test

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"encoding/json"

	"github.com/commonsyllabi/explorer/api/handlers"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var (
	syllabusID            uuid.UUID
	syllabusDeleteID      uuid.UUID
	syllabusNonExistingID uuid.UUID

	collectionID            uuid.UUID
	collectionDeleteID      uuid.UUID
	collectionNonExistingID uuid.UUID

	attachmentID            uuid.UUID
	attachmentDeleteID      uuid.UUID
	attachmentNonExistingID uuid.UUID
	attachmentFilePath      string

	userID            uuid.UUID
	userDeleteID      uuid.UUID
	userNonExistentID uuid.UUID

	instID uuid.UUID
)

func setup(t *testing.T) func(t *testing.T) {
	syllabusID = uuid.MustParse("46de6a2b-aacb-4c24-b1e1-3495821f846a")
	syllabusDeleteID = uuid.MustParse("46de6a2b-aacb-4c24-b1e1-3495821f8469")
	syllabusNonExistingID = uuid.New()

	collectionID = uuid.MustParse("b9e4c3ed-ac4f-4e44-bb43-5123b7b6d7a9")
	collectionDeleteID = uuid.MustParse("b9e4c3ed-ac4f-4e44-bb43-5123b7b6d7a9")
	collectionNonExistingID = uuid.New()

	attachmentID = uuid.MustParse("c55f0baf-12b8-4bdb-b5e6-2280bff8ab21")
	attachmentDeleteID = uuid.MustParse("c55f0baf-12b8-4bdb-b5e6-2280bff8ab30")
	attachmentNonExistingID = uuid.New()
	attachmentFilePath = filepath.Join(models.Basepath, "../../tests/files/image.png")

	userID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a8")
	userDeleteID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a9")
	userNonExistentID = uuid.New()

	instID = uuid.MustParse("c0e4c3ed-ac4f-4e44-bb43-5123b7b6d7a0")

	mustSeedDB(t)
	gin.SetMode(gin.TestMode)
	return func(t *testing.T) {

	}
}

func TestSyllabusHandler(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all syllabi", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusOK, res.Code)

		sylls := make([]models.Syllabus, 0)
		err := json.Unmarshal(res.Body.Bytes(), &sylls)
		require.Nil(t, err)
		assert.Equal(t, 3, len(sylls))
	})

	t.Run("Test create syllabus", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("title", "Test Syllabus Handling")
		w.WriteField("language", "en")
		w.WriteField("level", "0")
		// w.WriteField("academic_fields[]", "[300, 100]")
		// w.WriteField("academic_fields[]", 300)
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateSyllabus(c)

		assert.Equal(t, http.StatusCreated, res.Code)

		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		// assert.Equal(t, "Test Syllabus Handling", syll.Title)
		// assert.Equal(t, 2, len(syll.AcademicFields))
	})

	t.Run("Test create syllabus malformed field", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("title", "Test")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: syllabusID.String(),
			},
		}

		handlers.GetSyllabus(c)
		assert.Equal(t, http.StatusOK, res.Code)
		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		assert.Equal(t, "User-created 1", syll.Title)
	})

	t.Run("Test get syllabus non-existant ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: syllabusNonExistingID.String(),
			},
		}

		handlers.GetSyllabus(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test get syllabus malformed ID", func(t *testing.T) {
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

		handlers.GetSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update syllabus", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("title", "Updated Title")
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
				Value: syllabusID.String(),
			},
		}

		handlers.UpdateSyllabus(c)
		assert.Equal(t, res.Code, http.StatusOK)

		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		assert.Equal(t, "Updated Title", syll.Title)
	})

	t.Run("Test update syllabus malformed title", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("title", "U")
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
				Value: syllabusID.String(),
			},
		}

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update syllabus malformed field", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("wrong-field", "malicious")
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
				Value: syllabusID.String(),
			},
		}

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update syllabus non-existant ID", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("title", "Updated Title")
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
				Value: syllabusNonExistingID.String(),
			},
		}

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update syllabus malformed ID", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("title", "Updated Title")
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

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test add attachment to syllabus", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("attachment_id", attachmentID.String())
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
				Value: syllabusID.String(),
			},
		}

		handlers.AddSyllabusAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		assert.Equal(t, "Lorem ipsum descriptio", syll.Description)
	})

	t.Run("Test get all attachments from syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: syllabusID.String(),
			},
		}

		handlers.GetSyllabusAttachments(c)
		assert.Equal(t, http.StatusOK, res.Code)

		atts := make([]models.Attachment, 0)
		err := json.Unmarshal(res.Body.Bytes(), &atts)
		require.Nil(t, err)
		assert.Equal(t, 2, len(atts))
	})

	t.Run("Test get attachment from syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: syllabusID.String(),
			},
			{
				Key:   "res_id",
				Value: attachmentID.String(),
			},
		}

		handlers.GetSyllabusAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var att models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &att)
		require.Nil(t, err)
		assert.Equal(t, "Syllabus-owned Attachment 1", att.Name)
	})

	t.Run("Test remove attachment from syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: syllabusID.String(),
			},
			{
				Key:   "res_id",
				Value: attachmentID.String(),
			},
		}

		handlers.RemoveSyllabusAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var attachment models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &attachment)
		require.Nil(t, err)
		assert.Equal(t, syllabusID, attachment.UUID)
	})

	t.Run("Test add institution to syllabus", func(t *testing.T) {

	})

	t.Run("Test remove institution from syllabus", func(t *testing.T) {

	})

	t.Run("Test delete syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: syllabusID.String(),
			},
		}

		handlers.DeleteSyllabus(c)
		assert.Equal(t, res.Code, http.StatusOK)
	})

	t.Run("Test delete syllabus malformed ID", func(t *testing.T) {
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

		handlers.DeleteSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete syllabus non-existant ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: syllabusNonExistingID.String(),
			},
		}

		handlers.DeleteSyllabus(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

}

func mustSeedDB(t *testing.T) {
	databaseTestURL := os.Getenv("DATABASE_TEST_URL")
	if databaseTestURL == "" {
		databaseTestURL = "postgres://postgres:postgres@localhost:5432/explorer-test"
	}
	_, err := models.InitDB(databaseTestURL)
	require.Nil(t, err)
}
