package auth

import (
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"strings"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/commonsyllabi/explorer/mailer"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func Authenticate(c echo.Context) (string, error) {
	if os.Getenv("API_MODE") == "test" {
		return "e7b74bcd-c864-41ee-b5a7-d3031f76c8a8", nil
	}

	sess, err := session.Get("cosyl_auth", c)
	user := sess.Values["user"]
	if user == nil || err != nil {
		return "", fmt.Errorf("unauthorized user - %v", err)
	}
	return fmt.Sprintf("%s", user), nil
}

func Login(c echo.Context) error {
	sess, _ := session.Get("cosyl_auth", c)
	password := c.FormValue("password")
	email, err := mail.ParseAddress(c.FormValue("email"))
	if err != nil || strings.Trim(password, " ") == "" {
		return c.JSON(http.StatusBadRequest, gin.H{"error": "Parameters can't be empty"})
	}

	user, err := models.GetUserByEmail(email.Address)
	if err != nil || user.Status == models.UserPending {
		zero.Error(err.Error())
		return c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication failed"})
	}

	err = bcrypt.CompareHashAndPassword(user.Password, []byte(password))
	if err != nil {
		zero.Error(err.Error())
		return c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication failed"})
	}

	sess.Values["user"] = user.UUID.String()
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		zero.Error(err.Error())
		return c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
	}
	return c.JSON(http.StatusOK, user)
}

func Logout(c echo.Context) error {
	sess, _ := session.Get("cosyl_auth", c)
	user := sess.Values["user"]
	if user == nil {
		return c.JSON(http.StatusNotFound, gin.H{"error": "Invalid session token"})
	}

	sess.Values["user"] = nil
	if err := sess.Save(c.Request(), c.Response()); err != nil {
		return c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
	}

	return c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}

func Confirm(c echo.Context) error {
	token, err := uuid.Parse(c.QueryParam("token"))
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf(err.Error())
	}

	user, err := models.GetTokenUser(token)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf(err.Error())
	}

	user.Status = models.UserConfirmed
	user, err = models.UpdateUser(user.UUID, user.UUID, &user)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf(err.Error())
	}

	err = models.DeleteToken(token)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf(err.Error())
	}

	return c.JSON(http.StatusOK, user)
}

func RequestRecover(c echo.Context) error {
	email, err := mail.ParseAddress(c.FormValue("email"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	user, err := models.GetUserByEmail(email.Address)
	if err != nil {
		return c.JSON(http.StatusNotFound, err)
	}

	token, err := models.CreateToken(user.UUID)
	if err != nil {
		return c.JSON(http.StatusNotFound, err)
	}

	// send email with link
	if os.Getenv("API_MODE") != "test" {
		body := fmt.Sprintf("here is your recover link :%v!", token.UUID.String())
		mailer.SendMail(email.Address, "account recovery", body)
	}

	return c.String(http.StatusOK, "recovery email sent!")
}

// Recover takes a token and checks if it exists in the token table, and an optional password to update the associated user password
func Recover(c echo.Context) error {
	token, err := uuid.Parse(c.QueryParam("token"))
	if err != nil {
		c.String(http.StatusNotFound, "token not found")
		zero.Errorf("token not found %s", err)
	}

	user, err := models.GetTokenUser(token)
	if err != nil {
		c.String(http.StatusNotFound, "token not found")
		zero.Errorf("token not found %s", err)
	}

	var password struct {
		Value string `form:"password"`
	}

	err = c.Bind(&password)
	if err != nil {
		c.String(http.StatusBadRequest, "couldn't parse password")
		zero.Errorf("couldn't parse password %s", err)
	}

	if password.Value == "" {
		c.String(http.StatusNotModified, "password not modified")
	}

	// hash and update the password
	hashed, err := bcrypt.GenerateFromPassword([]byte(password.Value), bcrypt.DefaultCost)
	if err != nil {
		zero.Errorf("error hashing password: %v", err)
		return c.JSON(http.StatusInternalServerError, gin.H{"error updating user": err.Error()})
	}
	user.Password = hashed
	updated, err := models.UpdateUser(user.UUID, user.UUID, &user)
	if err != nil {
		c.String(http.StatusBadRequest, "couldn't update password")
		zero.Errorf("couldn't update password %s", err)
	}

	err = models.DeleteToken(token)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf(err.Error())
	}

	return c.JSON(http.StatusPartialContent, updated)
}

func Dashboard(c echo.Context) error {
	_, err := Authenticate(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}
	sess, _ := session.Get("cosyl_auth", c)
	user := sess.Values["user"]
	return c.JSON(http.StatusOK, user)
}
