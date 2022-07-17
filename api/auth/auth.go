package auth

import (
	"fmt"
	"net/http"
	"net/mail"
	"strings"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/commonsyllabi/explorer/mailer"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		sessionID := session.Get("user")
		if sessionID == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "unauthorized"})
			c.Abort()
			return
		}
	}
}

func Login(c *gin.Context) {
	session := sessions.Default(c)
	email := c.PostForm("email")
	password := c.PostForm("password")

	if strings.Trim(email, " ") == "" || strings.Trim(password, " ") == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Parameters can't be empty"})
		return
	}

	user, err := models.GetUserByEmail(email)
	if err != nil || user.Status == models.UserPending {
		zero.Error(err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication failed"})
		return
	}

	err = bcrypt.CompareHashAndPassword(user.Password, []byte(password))
	if err != nil {
		zero.Error(err.Error())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication failed"})
		return
	}

	session.Set("user", user.ID.String())
	if err := session.Save(); err != nil {
		zero.Error(err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Successfully authenticated user"})
}

func Logout(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get("user")
	if user == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid session token"})
		return
	}

	session.Delete("user")
	if err := session.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully logged out"})
}

func Confirm(c *gin.Context) {
	token, err := uuid.Parse(c.Query("token"))
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf(err.Error())
		return
	}

	user, err := models.GetTokenUser(token)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf(err.Error())
		return
	}

	user.Status = models.UserConfirmed
	user, err = models.UpdateUser(user.ID, &user)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf(err.Error())
		return
	}

	err = models.DeleteToken(token)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf(err.Error())
		return
	}

	c.JSON(http.StatusOK, user)
}

func RequestCredientalChange(c *gin.Context) {
	email, err := mail.ParseAddress(c.PostForm("email"))
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid email address")
		zero.Errorf("not a valid email %d", err)
		return
	}

	user, err := models.GetUserByEmail(email.Address)
	if err != nil {
		c.String(http.StatusNotFound, "user not found")
		zero.Errorf("user not found %s", err)
		return
	}

	token, err := models.CreateToken(user.ID)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf(err.Error())
		return
	}

	// send email with link
	if gin.Mode() != gin.TestMode {
		body := fmt.Sprintf("here is your update link :%v!", token.ID.String())
		mailer.SendMail(email.Address, "user created", body)
	}

	c.String(http.StatusOK, "recovery email sent!")

}

// Recover takes a token and checks if it exists in the token table, and an optional password to update the associated user password
func Recover(c *gin.Context) {
	zero.Warn("i'm supposed to take a recovery token and check if it is valid, then return yes or no. the actual password modification happens as a regular PATCH to the user, with the unique token as an authentication method")
	// check if recovery token is valid
	token, err := uuid.Parse(c.Param("token"))
	if err != nil {
		c.String(http.StatusNotFound, "token not found")
		zero.Errorf("token not found %s", err)
		return
	}

	user, err := models.GetTokenUser(token)
	if err != nil {
		c.String(http.StatusNotFound, "token not found")
		zero.Errorf("token not found %s", err)
		return
	}

	var password struct {
		value string `form:"password"`
	}

	err = c.Bind(password)
	if err != nil {
		c.String(http.StatusBadRequest, "couldn't parse password")
		zero.Errorf("couldn't parse password %s", err)
		return
	}

	if password.value == "" {
		c.String(http.StatusAccepted, "token found")
		return
	}

	// hash and update the password
	hashed, err := bcrypt.GenerateFromPassword([]byte(password.value), bcrypt.DefaultCost)
	if err != nil {
		zero.Errorf("error hashing password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error updating user": err.Error()})
		return
	}
	user.Password = hashed
	updated, err := models.UpdateUser(user.ID, &user)
	if err != nil {
		c.String(http.StatusBadRequest, "couldn't update password")
		zero.Errorf("couldn't update password %s", err)
		return
	}

	// send success
	c.JSON(http.StatusPartialContent, updated)
}

func Dashboard(c *gin.Context) {
	session := sessions.Default(c)
	user := session.Get("user")
	c.JSON(http.StatusOK, gin.H{"user": user})
}
