package api

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/commonsyllabi/explorer/api/config"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/stretchr/testify/assert"
)

var router *gin.Engine

var (
	syllabusID   uuid.UUID
	collectionID uuid.UUID
	attachmentID uuid.UUID
	userID       uuid.UUID
)

func setup(t *testing.T) func(t *testing.T) {
	syllabusID = uuid.MustParse("46de6a2b-aacb-4c24-b1e1-3495821f846a")
	collectionID = uuid.MustParse("b9e4c3ed-ac4f-4e44-bb43-5123b7b6d7a7")
	attachmentID = uuid.MustParse("c55f0baf-12b8-4bdb-b5e6-2280bff8ab21")
	userID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a8")

	gin.SetMode(gin.TestMode)
	router = mustSetupRouter()
	mustInitDB()

	return func(t *testing.T) {
		t.Log("tearing down api")
	}
}

func TestApi(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Testing server setup", func(t *testing.T) {
		var conf config.Config
		conf.DefaultConf()
		conf.TemplatesDir = "./templates"
		StartServer("2046", gin.TestMode, conf)
	})

	t.Run("Testing ping", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/ping", nil)
		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, res.Code, http.StatusOK, "expected 200, got %v", res.Code)
		assert.Equal(t, res.Body.String(), "pong", "expected pong, got: %v", res.Body.String())
	})

	t.Run("Testing not found", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/unexpectedurl", nil)
		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		result := res.Result()
		defer result.Body.Close()

		assert.Equal(t, res.Code, http.StatusNotFound, "expected 404, got %v", res.Code)
	})
}

func TestLoadConfig(t *testing.T) {
	err := conf.LoadConf("../api/config.yml")
	assert.NotNil(t, err)
}

func TestRoutes(t *testing.T) {
	t.Run("Test delete collection unauthorized", func(t *testing.T) {
		path := "/collections/" + collectionID.String()
		req := httptest.NewRequest(http.MethodDelete, path, nil)

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusUnauthorized, res.Code)
	})

	t.Run("Test delete syllabus unauthorized", func(t *testing.T) {
		path := "/syllabi/" + syllabusID.String()
		req := httptest.NewRequest(http.MethodDelete, path, nil)

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusUnauthorized, res.Code)
	})

	t.Run("Test delete user unauthorized", func(t *testing.T) {
		path := "/users/" + userID.String()
		req := httptest.NewRequest(http.MethodDelete, path, nil)

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusUnauthorized, res.Code)
	})

	t.Run("Test delete attachments unauthorized", func(t *testing.T) {
		path := "/attachments/" + attachmentID.String()
		req := httptest.NewRequest(http.MethodDelete, path, nil)

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusUnauthorized, res.Code)
	})

}

func mustSetupRouter() *gin.Engine {
	conf.DefaultConf()
	conf.TemplatesDir = "../api/templates"
	conf.FixturesDir = "../api/models/fixtures"

	router := SetupRouter()
	return router
}

func mustInitDB() *gorm.DB {
	databaseTestURL := os.Getenv("DATABASE_TEST_URL")
	if databaseTestURL == "" {
		databaseTestURL = "postgres://postgres:postgres@localhost:5432/explorer-test"
	}

	db, err := models.InitDB(databaseTestURL)
	if err != nil {
		panic(err)
	}

	return db
}
