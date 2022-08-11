package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/commonsyllabi/explorer/api/handlers"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

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
	userNonExistingID uuid.UUID

	instID uuid.UUID
)

func setup(t *testing.T) func(t *testing.T) {
	os.Setenv("API_MODE", "test")
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
	userNonExistingID = uuid.New()

	instID = uuid.MustParse("c0e4c3ed-ac4f-4e44-bb43-5123b7b6d7a0")

	mustSeedDB(t)
	return func(t *testing.T) {

	}
}

func TestSyllabusHandler(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all syllabi", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusOK, res.Code)

		sylls := make([]models.Syllabus, 0)
		err := json.Unmarshal(res.Body.Bytes(), &sylls)
		require.Nil(t, err)
		assert.Equal(t, 4, len(sylls))
	})

	t.Run("Test get all syllabi in academic fields", func(t *testing.T) {
		q := make(url.Values)
		q.Set("fields", "100,200")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)

		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusOK, res.Code)

		sylls := make([]models.Syllabus, 0)
		err := json.Unmarshal(res.Body.Bytes(), &sylls)
		require.Nil(t, err)
		assert.Equal(t, 1, len(sylls))
	})

	t.Run("Test get all syllabi in wrong academic fields", func(t *testing.T) {
		q := make(url.Values)
		q.Set("fields", "666")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)

		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get all syllabi in malformed academic fields", func(t *testing.T) {
		q := make(url.Values)
		q.Set("fields", "not_a_field")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)

		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get all syllabi with keywords", func(t *testing.T) {
		q := make(url.Values)
		q.Set("keywords", "Raum")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)
		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusOK, res.Code)

		sylls := make([]models.Syllabus, 0)
		err := json.Unmarshal(res.Body.Bytes(), &sylls)
		require.Nil(t, err)
		assert.Equal(t, 1, len(sylls))
	})

	t.Run("Test get all syllabi in a given language", func(t *testing.T) {
		q := make(url.Values)
		q.Set("languages", "de")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)
		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusOK, res.Code)

		sylls := make([]models.Syllabus, 0)
		err := json.Unmarshal(res.Body.Bytes(), &sylls)
		require.Nil(t, err)
		assert.Equal(t, 2, len(sylls))
	})

	t.Run("Test get all syllabi in a wrong language", func(t *testing.T) {
		q := make(url.Values)
		q.Set("languages", "not_a_language")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)

		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get all syllabi in a given academic_level", func(t *testing.T) {
		q := make(url.Values)
		q.Set("levels", "2")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)
		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusOK, res.Code)

		sylls := make([]models.Syllabus, 0)
		err := json.Unmarshal(res.Body.Bytes(), &sylls)
		require.Nil(t, err)
		assert.Equal(t, 1, len(sylls))
	})

	t.Run("Test get all syllabi in a wrong academic_level", func(t *testing.T) {
		q := make(url.Values)
		q.Set("fields", "666")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)

		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get all syllabi in a malformed academic_level", func(t *testing.T) {
		q := make(url.Values)
		q.Set("fields", "not_a_level")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)

		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get all syllabi with tags", func(t *testing.T) {
		q := make(url.Values)
		q.Set("tags", "vorkurs")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)

		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusOK, res.Code)

		sylls := make([]models.Syllabus, 0)
		err := json.Unmarshal(res.Body.Bytes(), &sylls)
		require.Nil(t, err)
		assert.Equal(t, 1, len(sylls))
	})

	t.Run("Test get all syllabi with combined filters", func(t *testing.T) {
		q := make(url.Values)
		q.Set("levels", "1")
		q.Set("keywords", "communication")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/syllabi/?"+q.Encode(), nil)
		c := echo.New().NewContext(req, res)

		handlers.GetSyllabi(c)
		assert.Equal(t, http.StatusOK, res.Code)

		sylls := make([]models.Syllabus, 0)
		err := json.Unmarshal(res.Body.Bytes(), &sylls)
		require.Nil(t, err)
		assert.Equal(t, 1, len(sylls))
	})

	t.Run("Test create syllabus", func(t *testing.T) {
		f := make(url.Values)
		f.Set("title", "Test Syllabus Handling")
		f.Set("language", "en")
		f.Set("academic_level", "0")
		f.Set("academic_fields[]", "300")
		f.Add("academic_fields[]", "200")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")

		handlers.CreateSyllabus(c)
		assert.Equal(t, http.StatusCreated, res.Code)

		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		assert.Equal(t, "Test Syllabus Handling", syll.Title)
		assert.Equal(t, 2, len(syll.AcademicFields))
		t.Log(syll.AcademicFields)
	})

	t.Run("Test create syllabus malformed field", func(t *testing.T) {
		f := make(url.Values)
		f.Set("title", "T")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")

		handlers.CreateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test create syllabus wrong academic level", func(t *testing.T) {
		f := make(url.Values)
		f.Set("title", "Testing")
		f.Set("language", "pl")
		f.Set("academic_level", "666")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")

		handlers.CreateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.GetSyllabus(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		assert.Equal(t, "Ungewohnt", syll.Title)
	})

	t.Run("Test get syllabus non-existing ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusNonExistingID.String())

		handlers.GetSyllabus(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test get syllabus malformed ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues("wrong")

		handlers.GetSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update syllabus", func(t *testing.T) {
		f := make(url.Values)
		f.Set("title", "Updated Title")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		assert.Equal(t, "Updated Title", syll.Title)
	})

	t.Run("Test update syllabus malformed title", func(t *testing.T) {
		f := make(url.Values)
		f.Set("title", "U")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update syllabus malformed language", func(t *testing.T) {
		f := make(url.Values)
		f.Set("language", "donut")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update syllabus malformed academic level", func(t *testing.T) {
		f := make(url.Values)
		f.Set("academic_level", "lol")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update syllabus wrong academic level", func(t *testing.T) {
		f := make(url.Values)
		f.Set("academic_level", "666")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update syllabus malformed field", func(t *testing.T) {
		f := make(url.Values)
		f.Set("wrong-field", "malicious")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusNoContent, res.Code)
	})

	t.Run("Test update syllabus non-existing ID", func(t *testing.T) {
		f := make(url.Values)
		f.Set("title", "Updated Title")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusNonExistingID.String())

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update syllabus malformed ID", func(t *testing.T) {
		f := make(url.Values)
		f.Set("title", "Updated Title")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues("wrong")

		handlers.UpdateSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test add attachment to syllabus", func(t *testing.T) {
		f := make(url.Values)
		f.Set("att_id", attachmentID.String())

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.AddSyllabusAttachment(c)
		require.Equal(t, http.StatusOK, res.Code)

		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		assert.Equal(t, "Updated Title", syll.Title)
	})

	t.Run("Test add attachment to non-existing syllabus", func(t *testing.T) {
		f := make(url.Values)
		f.Set("att_id", attachmentID.String())

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusNonExistingID.String())

		handlers.AddSyllabusAttachment(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test add non-existing attachment to syllabus", func(t *testing.T) {
		f := make(url.Values)
		f.Set("att_id", attachmentNonExistingID.String())

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.AddSyllabusAttachment(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test add attachment to syllabus malformed syll id", func(t *testing.T) {
		f := make(url.Values)
		f.Set("attachment_id", attachmentID.String())

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues("000-0-00-0-0lol00")

		handlers.AddSyllabusAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test add attachment to syllabus malformed att id", func(t *testing.T) {
		f := make(url.Values)
		f.Set("attachment_id", "lol-lol-lol")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.AddSyllabusAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get all attachments from syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi/:id/attachments")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.GetSyllabusAttachments(c)
		assert.Equal(t, http.StatusOK, res.Code)

		atts := make([]models.Attachment, 0)
		err := json.Unmarshal(res.Body.Bytes(), &atts)
		require.Nil(t, err)
		assert.Equal(t, 3, len(atts))
	})

	t.Run("Test get attachment from syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi/:id/attachments/:att_id")
		c.SetParamNames("id", "att_id")
		c.SetParamValues(syllabusID.String(), attachmentID.String())

		handlers.GetSyllabusAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var att models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &att)
		require.Nil(t, err)
		assert.Equal(t, "Chair website", att.Name)
	})

	t.Run("Test get non-existing attachment from syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi/:id/attachments/:att_id")
		c.SetParamNames("id", "att_id")
		c.SetParamValues(syllabusID.String(), attachmentNonExistingID.String())

		handlers.GetSyllabusAttachment(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test remove attachment from syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodDelete, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi/:id/attachments/:att_id")
		c.SetParamNames("id", "att_id")
		c.SetParamValues(syllabusID.String(), attachmentID.String())

		handlers.RemoveSyllabusAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var attachment models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &attachment)
		require.Nil(t, err)
		assert.Equal(t, syllabusID, attachment.UUID)
	})

	var newInstID uuid.UUID
	t.Run("Test add institution to syllabus", func(t *testing.T) {
		f := make(url.Values)
		f.Set("name", "fachhoschule")
		f.Set("country", "275")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi/:id/institutions")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.AddSyllabusInstitution(c)

		assert.Equal(t, http.StatusOK, res.Code)

		var syll models.Syllabus
		err := json.Unmarshal(res.Body.Bytes(), &syll)
		require.Nil(t, err)
		assert.Equal(t, 1, len(syll.Institutions))
		newInstID = syll.Institutions[0].UUID
	})

	t.Run("Test remove institution from syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi/:id/institutions/:inst_id")
		c.SetParamNames("id", "inst_id")
		c.SetParamValues(syllabusID.String(), newInstID.String())

		handlers.RemoveSyllabusInstitution(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var inst models.Institution
		err := json.Unmarshal(res.Body.Bytes(), &inst)
		require.Nil(t, err)
		assert.Equal(t, syllabusID, inst.UUID)
	})

	t.Run("Test delete syllabus", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodDelete, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues(syllabusID.String())

		handlers.DeleteSyllabus(c)
		assert.Equal(t, res.Code, http.StatusOK)
	})

	t.Run("Test delete syllabus malformed ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi")
		c.SetParamNames("id")
		c.SetParamValues("wrong")

		handlers.DeleteSyllabus(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete syllabus non-existant ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/syllabi/:id/institutions")
		c.SetParamNames("id")
		c.SetParamValues(syllabusNonExistingID.String())

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
