package auth

import (
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"strings"
	"time"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/commonsyllabi/explorer/mailer"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"

	"github.com/golang-jwt/jwt"
)

type JWTCustomClaims struct {
	Name  string `json:"name"`
	UUID  string `json:"uuid"`
	Email string `json:"email"`
	jwt.StandardClaims
}

func Authenticate(c echo.Context) (uuid.UUID, error) {
	if os.Getenv("API_MODE") == "test" {
		return uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a8"), nil
	}

	t := c.QueryParam("token")
	if t != "" {
		token, err := uuid.Parse(t)
		if err != nil {
			return uuid.Nil, err
		}

		if token != uuid.Nil && token.String() == os.Getenv("ADMIN_KEY") {
			return token, nil
		}
	}

	authHeader := c.Request().Header["Authorization"]
	if len(authHeader) == 0 {
		return uuid.Nil, nil
	}
	raw := c.Request().Header["Authorization"][0]
	tokenString := strings.Split(raw, " ")[1]
	token, err := jwt.ParseWithClaims(tokenString, &JWTCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected JWT signing method")
		}
		return []byte("cosyl"), nil
	})

	if err != nil {
		return uuid.Nil, err
	}

	if !token.Valid {
		return uuid.Nil, fmt.Errorf("unauthorized user - %v", token)
	}

	claims := token.Claims.(*JWTCustomClaims)

	return uuid.MustParse(claims.UUID), nil
}

func Login(c echo.Context) error {
	password := c.FormValue("password")
	email, err := mail.ParseAddress(c.FormValue("email"))
	if err != nil || strings.Trim(password, " ") == "" {
		return c.String(http.StatusBadRequest, "Parameters can't be empty")
	}

	user, err := models.GetUserByEmail(email.Address, uuid.Nil)
	if err != nil || user.Status == models.UserPending {
		zero.Error(err.Error())
		return c.String(http.StatusUnauthorized, "Authentication failed")
	}

	err = bcrypt.CompareHashAndPassword(user.Password, []byte(password))
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusUnauthorized, "Authentication failed")
	}

	claims := &JWTCustomClaims{
		user.Name,
		user.UUID.String(),
		user.Email,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(time.Hour * 72).Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString([]byte("cosyl"))
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Authentication failed")
	}

	return c.JSON(http.StatusOK, echo.Map{
		"user":  user,
		"token": t,
	})
}

type Token struct {
	Token string `json:"token" form:"token"`
}

func Confirm(c echo.Context) error {
	t := new(Token)
	c.Bind(t)
	token, err := uuid.Parse(t.Token)

	if err != nil {
		zero.Errorf(err.Error())
		return c.String(http.StatusBadRequest, "The token format is incorrect")
	}

	user, err := models.GetTokenUser(token)
	if err != nil {
		zero.Errorf(err.Error())
		return c.String(http.StatusNotFound, "The confirmation token could not be found.")
	}

	user.Status = models.UserConfirmed
	user, err = models.UpdateUser(user.UUID, user.UUID, &user)
	if err != nil {
		zero.Errorf(err.Error())
		return c.String(http.StatusNotFound, "The user account was not found.")
	}

	err = models.DeleteToken(token)
	if err != nil {
		zero.Errorf(err.Error())
		return c.String(http.StatusInternalServerError, "There was an internal problem. Please try again later.")
	}

	return c.JSON(http.StatusOK, user)
}

func RequestRecover(c echo.Context) error {
	email, err := mail.ParseAddress(c.FormValue("email"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	user, err := models.GetUserByEmail(email.Address, uuid.Nil)
	if err != nil {
		return c.JSON(http.StatusNotFound, err)
	}

	token, err := models.CreateToken(user.UUID)
	if err != nil {
		return c.JSON(http.StatusNotFound, err)
	}

	var host string
	if os.Getenv("API_MODE") == "release" {
		host = "https://explorer.common-syllabi.org"
	} else {
		host = "http://localhost:3000"
	}

	// send email with link
	if os.Getenv("API_MODE") != "test" {
		body := mailer.ConfirmationPayload{
			Name:  user.Name,
			Host:  host,
			Token: token.UUID.String(),
		}

		mailer.SendMail(email.Address, "Account recovery", "account_recovery", body)
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
	uuid, err := Authenticate(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	return c.JSON(http.StatusOK, uuid)
}
