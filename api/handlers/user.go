package handlers

import (
	"fmt"
	"net/http"
	"net/mail"
	"strconv"
	"time"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"
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

	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

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

	c.JSON(http.StatusCreated, user)
}

func UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	err = sanitizeUserUpdate(c)
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

	user.UpdatedAt = time.Now()
	_, err = models.UpdateUser(int64(id), &user)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error updating User %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, user)
}

func GetUser(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	user, err := models.GetUser(int64(id))
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
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	err = models.DeleteUser(int64(id))
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting User %d: %v", id, err)
		return
	}

	//-- TODO delete any associated resources?
	c.JSON(http.StatusOK, gin.H{"id": id})
}

func sanitizeUserCreate(c *gin.Context) error {

	if c.PostForm("email") == "" || c.PostForm("password") == "" {
		zero.Error("Cannot have empty email or password")
		return fmt.Errorf("cannot have empty title, description or email")

	}

	if len(c.PostForm("email")) < 10 || len(c.PostForm("email")) > 50 {
		zero.Errorf("the email of the User should be between 10 and 50 characters: %d", len(c.PostForm("email")))
		return fmt.Errorf("the email of the User should be between 10 and 50 characters: %d", len(c.PostForm("email")))
	}

	if len(c.PostForm("password")) < 8 || len(c.PostForm("password")) > 20 {
		zero.Errorf("the email of the User should be between 8 and 20 characters: %d", len(c.PostForm("email")))
		return fmt.Errorf("the email of the User should be between 10 and 50 characters: %d", len(c.PostForm("email")))
	}

	_, err := mail.ParseAddress(c.PostForm("email"))
	return err
}

func sanitizeUserUpdate(c *gin.Context) error {
	zero.Warn("implement me!")
	return nil
}
