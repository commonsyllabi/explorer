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

func TestUserHandler(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	t.Run("Test get all users", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		handlers.GetAllUsers(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test create user", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("email", "testing@user.com")
		w.WriteField("password", "12345678")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateUser(c)

		assert.Equal(t, http.StatusCreated, res.Code)
	})

	t.Run("Test create user with wrong field", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("non-existant", "testing-wrong@user.com")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateUser(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test create user with wrong fields", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("non-existant", "testing@user.com")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateUser(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test create user malformed email", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("email", "testinguser.com")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateUser(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test create user malformed email", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("email", "short")
		w.Close()

		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "POST"
		c.Request.Header.Set("Content-Type", w.FormDataContentType())
		c.Request.Body = io.NopCloser(&body)

		handlers.CreateUser(c)

		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get user", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: userID.String(),
			},
		}

		handlers.GetUser(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test get user malformed id", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: "malformed",
			},
		}

		handlers.GetUser(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test get user non-existant id", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "GET"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: userNonExistentID.String(),
			},
		}

		handlers.GetUser(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update user", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("email", "updated@user.com")
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
				Value: userID.String(),
			},
		}

		handlers.UpdateUser(c)
		assert.Equal(t, http.StatusOK, res.Code)

		var user models.User
		err := json.Unmarshal(res.Body.Bytes(), &user)
		require.Nil(t, err)
		assert.Equal(t, "updated@user.com", user.Email)
		assert.NotZero(t, user.ID)
	})

	t.Run("Test update user wrong id", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("email", "updated-wrong-id@user.com")
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

		handlers.UpdateUser(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

	t.Run("Test update user wrong field", func(t *testing.T) {
		var body bytes.Buffer
		w := multipart.NewWriter(&body)
		w.WriteField("not-field", "malicious-update-no-field@user.com")
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
				Value: userID.String(),
			},
		}

		handlers.UpdateUser(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete user", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: userID.String(),
			},
		}

		handlers.DeleteUser(c)
		assert.Equal(t, http.StatusOK, res.Code)
	})

	t.Run("Test delete user malformed ID", func(t *testing.T) {
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

		handlers.DeleteUser(c)
		assert.Equal(t, http.StatusBadRequest, res.Code)
	})

	t.Run("Test delete user non-existing ID", func(t *testing.T) {
		res := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(res)
		c.Request = &http.Request{
			Header: make(http.Header),
		}

		c.Request.Method = "DELETE"
		c.Params = []gin.Param{
			{
				Key:   "id",
				Value: userNonExistentID.String(),
			},
		}

		handlers.DeleteUser(c)
		assert.Equal(t, http.StatusNotFound, res.Code)
	})

}
