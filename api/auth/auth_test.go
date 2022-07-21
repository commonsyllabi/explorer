package auth_test

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"

	"github.com/commonsyllabi/explorer/api"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

var router *gin.Engine

func setup(t *testing.T) func(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router = mustSetupRouter()
	mustInitDB()

	return func(t *testing.T) {
		t.Log("tearing down api")
	}
}

func TestAuth(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	var cookie http.Cookie

	t.Run("Testing login", func(t *testing.T) {
		data := url.Values{}
		data.Add("email", "auth@test.com")
		data.Add("password", "12345678")
		body := bytes.NewBuffer([]byte(data.Encode()))

		req := httptest.NewRequest(http.MethodPost, "/login", body)
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Set("Cookie", "Set-Cookie")

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		require.Equal(t, http.StatusOK, res.Code)
		require.NotZero(t, len(res.Result().Cookies()))
		if len(res.Result().Cookies()) > 0 {
			cookie = *res.Result().Cookies()[0]
		}

		assert.Equal(t, cookie.Name, "cosyl_auth")
	})

	t.Run("Testing authorized access", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/dashboard", nil)
		req.AddCookie(&cookie)

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Testing logout", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/logout", nil)
		req.AddCookie(&cookie)
		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusOK, res.Code)

		require.NotZero(t, len(res.Result().Cookies()))
		if len(res.Result().Cookies()) > 0 {
			cookie = *res.Result().Cookies()[0]
		}

		req = httptest.NewRequest(http.MethodGet, "/dashboard", nil)
		req.AddCookie(&cookie)
		res = httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusUnauthorized, res.Code)
	})

}

func mustSetupRouter() *gin.Engine {
	var conf api.Config
	conf.DefaultConf()
	conf.TemplatesDir = "../api/templates"
	conf.FixturesDir = "../api/models/fixtures"

	router := api.SetupRouter()
	return router
}

func mustInitDB() *gorm.DB {
	databaseTestURL := os.Getenv("DATABASE_TEST_URL")
	if databaseTestURL == "" {
		databaseTestURL = "postgres://postgres:postgres@localhost:5432/explorer-test"
		fmt.Printf("didn't get db test url from env, defaulting to %v\n", databaseTestURL)
	}

	db, err := models.InitDB(databaseTestURL)
	if err != nil {
		panic(err)
	}

	return db
}
