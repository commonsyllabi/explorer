package api

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAuth(t *testing.T) {
	teardown := setup(t)
	defer teardown(t)

	var cookie http.Cookie

	t.Run("Testing login", func(t *testing.T) {

		data := url.Values{}
		data.Add("email", "one@raz.com")
		data.Add("password", "12345678")
		body := bytes.NewBuffer([]byte(data.Encode()))

		req := httptest.NewRequest(http.MethodPost, "/login", body)
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Set("Coookie", "Set-Cookie")

		res := httptest.NewRecorder()
		router.ServeHTTP(res, req)

		require.Equal(t, http.StatusOK, res.Code)
		require.NotNil(t, len(res.Result().Cookies()))
		cookie = *res.Result().Cookies()[0]

		assert.Equal(t, cookie.Name, "authsession")
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

		cookie = *res.Result().Cookies()[0]
		assert.Equal(t, http.StatusOK, res.Code)

		req = httptest.NewRequest(http.MethodGet, "/dashboard", nil)
		req.AddCookie(&cookie)
		res = httptest.NewRecorder()
		router.ServeHTTP(res, req)

		assert.Equal(t, http.StatusUnauthorized, res.Code)
	})

}
