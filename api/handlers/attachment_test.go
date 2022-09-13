package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/commonsyllabi/explorer/api/config"
	"github.com/commonsyllabi/explorer/api/handlers"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/labstack/echo/v4"

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
		req := httptest.NewRequest(http.MethodGet, "/attachments", nil)
		c := echo.New().NewContext(req, res)

		handlers.GetAllAttachments(c)
		assert.Equal(t, http.StatusOK, res.Code)

		atts := make([]models.Attachment, 0)
		err := json.Unmarshal(res.Body.Bytes(), &atts)
		require.Nil(t, err)
		assert.Equal(t, 5, len(atts))
	})

	t.Run("Test create attachment with file", func(t *testing.T) {
		f := make(url.Values)
		f.Set("name", "Test Attachment file")
		f.Set("desc", "")
		f.Set("url", "")

		q := make(url.Values)
		q.Set("syllabusID", syllabusID.String())

		t.Skip("how to upload a file with echo test")
		// var fw io.Writer
		// file := mustOpen(attachmentFilePath)
		// fw, err := w.CreateFormFile("file", file.Name())
		// if err != nil {
		// 	t.Error(err)
		// }

		// if _, err := io.Copy(fw, file); err != nil {
		// 	t.Error(err)
		// }
		//

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/attachments?"+q.Encode(), strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
		c := echo.New().NewContext(req, res)
		c.Set("config", conf)

		handlers.CreateAttachment(c)
		assert.Equal(t, http.StatusCreated, res.Code)

		var att models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &att)
		require.Nil(t, err)
		assert.Equal(t, "Test Attachment file", att.Name)
		assert.Equal(t, "file", att.Type)
		// assert.Contains(t, att.URL, filepath.Base(file.Name()))
	})

	t.Run("Test create attachment with URL", func(t *testing.T) {
		f := make(url.Values)
		f.Set("name", "Test Attachment URL")
		f.Set("desc", "")
		f.Set("url", "http://enframed.net")

		q := make(url.Values)
		q.Set("syllabus_id", syllabusID.String())

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/attachments?"+q.Encode(), strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)
		c := echo.New().NewContext(req, res)
		c.Set("config", conf)

		handlers.CreateAttachment(c)
		t.Log(res.Body.String())
		assert.Equal(t, http.StatusCreated, res.Code)
		var att models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &att)
		require.Nil(t, err)
		assert.Equal(t, "Test Attachment URL", att.Name)
		assert.Equal(t, "weblink", att.Type)
	})

	t.Run("Test create attachment malformed input", func(t *testing.T) {
		f := make(url.Values)
		f.Set("name", "Shrt")

		q := make(url.Values)
		q.Set("syllabusID", syllabusID.String())

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/attachments?"+q.Encode(), strings.NewReader(f.Encode()))
		c := echo.New().NewContext(req, res)
		c.Set("config", conf)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		handlers.CreateAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test create attachment wrong field", func(t *testing.T) {
		f := make(url.Values)
		f.Set("wrong-field", "Updated Name")

		q := make(url.Values)
		q.Set("syllabusID", syllabusID.String())

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/attachments?"+q.Encode(), strings.NewReader(f.Encode()))
		c := echo.New().NewContext(req, res)
		c.Set("config", conf)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		handlers.CreateAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get attachment", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/attachments", nil)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues(attachmentID.String())

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
		req := httptest.NewRequest(http.MethodGet, "/attachments", nil)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues("wrong")

		handlers.GetAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get attachment non-existant ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/attachments", nil)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues(attachmentUnknownID.String())

		handlers.GetAttachment(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update attachment", func(t *testing.T) {
		f := make(url.Values)
		f.Set("name", "Updated Name")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/attachments", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues(attachmentID.String())

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var att models.Attachment
		err := c.Bind(&att)
		require.Nil(t, err)
		assert.Equal(t, "Updated Name", att.Name)
	})

	t.Run("Test update attachment malformed ID", func(t *testing.T) {
		f := make(url.Values)
		f.Set("name", "Updated Name")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/attachments", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues("wrong")

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update attachment malformed field", func(t *testing.T) {
		f := make(url.Values)
		f.Set("malicious-field", "Short")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/attachments", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues(attachmentID.String())

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test update attachment non-existent ID", func(t *testing.T) {
		f := make(url.Values)
		f.Set("name", "Updated Name")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/attachments", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues(attachmentUnknownID.String())

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update attachment malformed name", func(t *testing.T) {
		f := make(url.Values)
		f.Set("name", "Sh")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/attachments", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues(attachmentID.String())

		handlers.UpdateAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete attachment", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodDelete, "/attachments", nil)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues(attachmentDeleteID.String())

		handlers.DeleteAttachment(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var att models.Attachment
		err := json.Unmarshal(res.Body.Bytes(), &att)
		require.Nil(t, err)
		assert.Equal(t, attachmentDeleteID, att.UUID)
	})

	t.Run("Test delete malformed attachment", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodDelete, "/attachments", nil)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues("wrong")

		handlers.DeleteAttachment(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete non-existant attachment", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodDelete, "/attachments", nil)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetParamNames("id")
		c.SetParamValues(attachmentUnknownID.String())

		handlers.DeleteAttachment(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

}
