package handlers

import (
	"fmt"
	"net/http"
	"net/mail"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/commonsyllabi/explorer/mailer"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func GetAllUsers(c *gin.Context) {
	users, err := models.GetAllUsers()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error getting users: %v", err)
		return
	}

	c.JSON(http.StatusOK, users)
}

func CreateUser(c *gin.Context) {
	err := sanitizeUserCreate(c)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	var user models.User
	err = c.Bind(&user)
	if err != nil {
		zero.Errorf("error binding user: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(c.PostForm("password")), bcrypt.DefaultCost)
	if err != nil {
		zero.Errorf("error hashing password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error creating user": err.Error()})
		return
	}
	user.Password = hashed

	user, err = models.CreateUser(&user)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error creating User: %v", err)
		return
	}

	if gin.Mode() != gin.TestMode {
		token, err := models.CreateToken(user.UUID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, err)
			zero.Errorf(err.Error())
			return
		}
		body := fmt.Sprintf("the user %s was successfully created with token %s!", user.UUID, token.UUID)
		mailer.SendMail(user.Email, "user created", body)
	}

	c.JSON(http.StatusCreated, user)
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Errorf(err.Error())
		return
	}

	err = sanitizeUserUpdate(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Error(err.Error())
		return
	}

	_, err = models.GetUser(uid)
	if err != nil {
		c.JSON(http.StatusNotFound, err)
		return
	}

	var user models.User
	err = c.Bind(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Errorf("error binding user: %v", err)
		return
	}

	updated, err := models.UpdateUser(uid, &user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		zero.Errorf("error updating User %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func GetUser(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	user, err := models.GetUser(uid)
	if err != nil {
		zero.Errorf("error getting User %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the User.",
		})

		return
	}

	c.JSON(http.StatusOK, user)

}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	user, err := models.DeleteUser(uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting User %d: %v", id, err)
		return
	}

	if gin.Mode() != gin.TestMode {
		body := fmt.Sprintf("the user %s was successfully deleted!", user.UUID)
		mailer.SendMail(user.Email, "user deleted", body)
	}

	c.JSON(http.StatusOK, user)
}

func sanitizeUserCreate(c *gin.Context) error {
	pw := fmt.Sprintf("%v", c.PostForm("password"))
	if len(pw) < 8 || len(pw) > 20 {
		zero.Error("the password should be between 8 and 20 characters")
		return fmt.Errorf("the password should be between 8 and 20 characters")
	}

	_, err := mail.ParseAddress(c.PostForm("email"))
	return err
}

func sanitizeUserUpdate(c *gin.Context) error {
	if c.PostForm("email") != "" {
		_, err := mail.ParseAddress(c.PostForm("email"))
		if err != nil {
			return err
		}
	}

	return nil
}
