package api

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"

	"github.com/stretchr/testify/assert"
)

var router *gin.Engine

func setup(t *testing.T) func(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router = mustSetupRouter()
	return func(t *testing.T) {
		t.Log("tearing down api")
	}
}

func TestApi(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Testing server setup", func(t *testing.T) {
		var conf Config
		conf.DefaultConf()
		conf.TemplatesDir = "./templates"
		err := StartServer("2046", gin.TestMode, conf)
		assert.Equal(t, err, nil, "Expected error from start server to be nil, got %v", err)
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

func mustSetupRouter() *gin.Engine {
	conf.DefaultConf()
	conf.TemplatesDir = "../api/templates"
	conf.FixturesDir = "../api/models/fixtures"

	databaseTestURL := os.Getenv("DATABASE_TEST_URL")
	if databaseTestURL == "" {
		databaseTestURL = "postgres://cosyl:cosyl@localhost:5432/explorer-test"
		fmt.Printf("didn't get db test url from env, defaulting to %v\n", databaseTestURL)
	}

	_, err := models.InitDB(databaseTestURL)
	if err != nil {
		panic(err)
	}
	router, err := setupRouter()
	if err != nil {
		panic(err)
	}
	return router
}
