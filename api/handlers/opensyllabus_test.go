package handlers_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/commonsyllabi/explorer/api/config"
	"github.com/commonsyllabi/explorer/api/handlers"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParseOpenSyllabus(t *testing.T) {
	os.Setenv("API_MODE", "test")
	os.Setenv("OPENSYLLABUS_PARSER_API_URL", "https://parser-api.opensyllabus.org/v1/")
	var conf config.Config
	conf.DefaultConf()

	t.Run("parsing open syllabus", func(t *testing.T) {
		path := filepath.Join(models.Basepath, "../../tests/files", "osp.docx")
		fmt.Println(path)

		inputSyllabus, err := os.ReadFile(path)
		if err != nil {
			t.Error(t, err)
		}

		body := new(bytes.Buffer)
		writer := multipart.NewWriter(body)
		writer.WriteField("name", "Test Attachment file")
		writer.WriteField("description", "Test description")
		writer.WriteField("url", "")
		part, _ := writer.CreateFormFile("file", "input.docx") //-- todo open actual file
		part.Write(inputSyllabus)
		writer.Close()

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/attachments", body)
		req.Header.Set(echo.HeaderContentType, writer.FormDataContentType()) // <<< important part
		c := echo.New().NewContext(req, res)
		c.Set("config", conf)

		handlers.ParseSyllabusFile(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var osp models.OpenSyllabusParsed
		err = json.Unmarshal(res.Body.Bytes(), &osp)
		require.Nil(t, err)
	})
}
