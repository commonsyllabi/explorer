package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/commonsyllabi/explorer/api/handlers"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUserHandler(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all users", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		c := echo.New().NewContext(req, res)
		c.SetPath("/users")
		handlers.GetAllUsers(c)
		assert.Equal(t, http.StatusOK, res.Code)

		users := make([]models.User, 0)
		err := json.Unmarshal(res.Body.Bytes(), &users)
		require.Nil(t, err)
		assert.Equal(t, 4, len(users))
	})

	t.Run("Test create user", func(t *testing.T) {
		f := make(url.Values)
		f.Set("email", "testing@user.com")
		f.Set("password", "12345678")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users")
		handlers.CreateUser(c)
		assert.Equal(t, http.StatusCreated, res.Code)

		var user models.User
		err := json.Unmarshal(res.Body.Bytes(), &user)
		require.Nil(t, err)
		assert.Equal(t, "testing@user.com", user.Email)
		assert.NotZero(t, user.UUID)
	})

	t.Run("Test create user with wrong field", func(t *testing.T) {
		f := make(url.Values)
		f.Set("non-existant", "testing-wrong@user.com")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users")

		handlers.CreateUser(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test create user with wrong fields", func(t *testing.T) {
		f := make(url.Values)
		f.Set("non-existant", "testing@user.com")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users")
		handlers.CreateUser(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test create user malformed email", func(t *testing.T) {
		f := make(url.Values)
		f.Set("email", "testinguser.com")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users")
		handlers.CreateUser(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get user", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users")
		c.SetParamNames("id")
		c.SetParamValues(userID.String())

		handlers.GetUser(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var user models.User
		err := json.Unmarshal(res.Body.Bytes(), &user)
		require.Nil(t, err)
		assert.Equal(t, "Justyna Poplawska", user.Name)
	})

	t.Run("Test get user malformed id", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users")
		c.SetParamNames("id")
		c.SetParamValues("malformed")

		handlers.GetUser(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get user non-existant id", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/", nil)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users")
		c.SetParamNames("id")
		c.SetParamValues(userNonExistingID.String())

		handlers.GetUser(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update user", func(t *testing.T) {
		f := make(url.Values)
		f.Set("email", "user@updated.com")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users")
		c.SetParamNames("id")
		c.SetParamValues(userID.String())

		handlers.UpdateUser(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var user models.User
		err := json.Unmarshal(res.Body.Bytes(), &user)
		require.Nil(t, err)
		assert.Equal(t, "user@updated.com", user.Email)
		assert.NotZero(t, user.UUID)
	})

	t.Run("Test update user non-existent id", func(t *testing.T) {
		f := make(url.Values)
		f.Set("email", "updated-wrong-id@user.com")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPatch, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users")
		c.SetParamNames("id")
		c.SetParamValues(userNonExistingID.String())

		handlers.UpdateUser(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	var newInstID uuid.UUID
	t.Run("Test add institution to user", func(t *testing.T) {
		f := make(url.Values)
		f.Set("name", "fachhoschule")
		f.Set("country", "275")

		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(f.Encode()))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users/:id/institutions")
		c.SetParamNames("id")
		c.SetParamValues(userID.String())

		handlers.AddUserInstitution(c)

		assert.Equal(t, http.StatusOK, res.Code)

		var user models.User
		err := json.Unmarshal(res.Body.Bytes(), &user)
		require.Nil(t, err)
		assert.Equal(t, 2, len(user.Institutions))
		newInstID = user.Institutions[0].UUID
	})

	t.Run("Test remove institution from user", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodDelete, "/", nil)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users/:id/institutions/:inst_id")
		c.SetParamNames("id", "inst_id")
		c.SetParamValues(userID.String(), newInstID.String())

		handlers.RemoveUserInstitution(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var user models.User
		err := json.Unmarshal(res.Body.Bytes(), &user)
		require.Nil(t, err)
		assert.Equal(t, 1, len(user.Institutions))
	})

	t.Run("Test delete user", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodDelete, "/", nil)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users/:id")
		c.SetParamNames("id")
		c.SetParamValues(userID.String())

		handlers.DeleteUser(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var user models.User
		err := json.Unmarshal(res.Body.Bytes(), &user)
		require.Nil(t, err)
		assert.Equal(t, "Justyna Poplawska", user.Name)
	})

	t.Run("Test delete user malformed ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users/:id")
		c.SetParamNames("id")
		c.SetParamValues("wrong")

		handlers.DeleteUser(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete user non-existing ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationForm)

		c := echo.New().NewContext(req, res)
		c.SetPath("/users/:id/institutions")
		c.SetParamNames("id")
		c.SetParamValues(userNonExistingID.String())

		handlers.DeleteUser(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

}
