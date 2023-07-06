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
	frags := strings.Split(raw, " ")
	if len(frags) == 1 {
		return uuid.Nil, errors.New("no token on Authorization header")
	}

	tokenString := frags[1]
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
		if err != nil {
			zero.Error(err.Error())
		} else {
			zero.Error("User not found")
		}
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

	var user models.User
	user, err = models.GetTokenUser(token)
	if err != nil {
		// no regular user found, check deleted tokens
		user, err = models.GetDeletedTokenUser(token)
		if err != nil {
			zero.Errorf(err.Error())
			return c.String(http.StatusNotFound, "The confirmation token could not be found.")
		}

		if user.Status == models.UserConfirmed {
			return c.JSON(http.StatusOK, user)
		} else {
			zero.Error("the token is deleted and the user not confirmed")
			return c.String(http.StatusNotFound, "The confirmation token could not be found.")
		}
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
		zero.Errorf("could not find email")
		return c.String(http.StatusBadRequest, err.Error())
	}

	user, err := models.GetUserByEmail(email.Address, uuid.Nil)
	if err != nil {
		zero.Errorf("could not find user")
		return c.String(http.StatusNotFound, err.Error())
	}

	if user.UUID == uuid.Nil {
		zero.Errorf("could not find user UUID")
		return c.String(http.StatusNotFound, "user has nil uuid")
	}

	token, err := models.CreateToken(user.UUID)
	if err != nil {
		zero.Errorf("could not create token")
		return c.String(http.StatusNotFound, err.Error())
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

		err := mailer.SendMail(email.Address, "Account recovery", "account_recovery", body)
		if err != nil {
			zero.Errorf(err.Error())
			return c.String(http.StatusInternalServerError, err.Error())
		}
	}

	return c.String(http.StatusOK, "recovery email sent!")
}

// Recover takes a token and checks if it exists in the token table, and a password to update the associated user password
func Recover(c echo.Context) error {
	token, err := uuid.Parse(c.QueryParam("token"))
	if err != nil {
		zero.Errorf("token param not found %s", err)
		return c.String(http.StatusNotFound, "token not found")
	}

	user, err := models.GetTokenUser(token)
	if err != nil {
		zero.Errorf("user not found %s", err)
		return c.String(http.StatusNotFound, "user not found")
	}

	var password struct {
		Value string `form:"password"`
	}

	err = c.Bind(&password)
	if err != nil {
		zero.Errorf("couldn't parse password %s", err)
		return c.String(http.StatusBadRequest, "couldn't parse password")
	}

	if password.Value == "" {
		return c.String(http.StatusNotModified, "password not modified")
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
		zero.Errorf("couldn't update password %s", err)
		return c.String(http.StatusBadRequest, "couldn't update password")
	}

	err = models.DeleteToken(token)
	if err != nil {
		zero.Errorf(err.Error())
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusPartialContent, updated)
}

func Admin(c echo.Context) error {
	uuid, err := Authenticate(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	params := make(map[string]any, 0)
	params["page"] = 0
	params["fields"] = "%"
	params["keywords"] = "%"
	params["languages"] = "%"
	params["levels"] = "%"
	params["tags"] = "%"

	syll, err := models.GetSyllabi(params, uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, err.Error())
	}

	coll, err := models.GetAllCollections(uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, err.Error())
	}

	users, err := models.GetAllUsers()
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, echo.Map{"syllabi": syll, "collections": coll, "users": users})
}
