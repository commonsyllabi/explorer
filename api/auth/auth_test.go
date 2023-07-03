package auth_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"

	"github.com/commonsyllabi/explorer/api"
	"github.com/commonsyllabi/explorer/api/config"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

var (
	router          *echo.Echo
	userConfirmID   uuid.UUID
	tokenConfirmID  uuid.UUID
	tokenRecoveryID uuid.UUID
)

func setup(t *testing.T) func(t *testing.T) {
	os.Setenv("API_MODE", "test")

	tokenConfirmID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c801")
	tokenRecoveryID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c901")
	userConfirmID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c800")

	router = mustSetupRouter()
	mustInitDB()

	return func(t *testing.T) {
	}
}

func TestAuth(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	var token echo.Map

	t.Run("Testing login", func(t *testing.T) {
		data := url.Values{}
		data.Add("email", "pat@shiu.com")
		data.Add("password", "12345678")
		body := bytes.NewBuffer([]byte(data.Encode()))

		req := httptest.NewRequest(http.MethodPost, "/login", body)
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Set("Cookie", "Set-Cookie")

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		require.Equal(t, http.StatusOK, res.Code)

		err := json.Unmarshal(res.Body.Bytes(), &token)
		require.Nil(t, err)
	})

	t.Run("Testing authorized access", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/admin", nil)
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token["token"]))

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Testing confirm user account", func(t *testing.T) {
		obj := map[string]string{
			"token": tokenConfirmID.String(),
		}
		body, _ := json.Marshal(obj)
		req := httptest.NewRequest(http.MethodPost, "/auth/confirm", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		require.Equal(t, http.StatusOK, res.Code)
		var user models.User
		err := json.Unmarshal(res.Body.Bytes(), &user)
		require.Nil(t, err)
		assert.NotZero(t, user.UUID)
		assert.Equal(t, "confirmed", user.Status)
	})

	t.Run("Testing request recovery token", func(t *testing.T) {
		data := url.Values{}
		data.Add("email", "auth-pending@test.com")
		body := bytes.NewBuffer([]byte(data.Encode()))
		req := httptest.NewRequest(http.MethodPost, "/auth/request-recover", body)
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Testing verify recovery request", func(t *testing.T) {
		path := fmt.Sprintf("/auth/check-recover?token=%s", tokenRecoveryID)
		data := url.Values{}
		data.Add("password", "135791113")
		body := bytes.NewBuffer([]byte(data.Encode()))
		req := httptest.NewRequest(http.MethodPost, path, body)
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusPartialContent, res.Code)
	})

}

func mustSetupRouter() *echo.Echo {
	var conf config.Config
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
	}

	db, err := models.InitDB(databaseTestURL)
	if err != nil {
		panic(err)
	}

	return db
}
