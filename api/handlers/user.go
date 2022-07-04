package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/mail"
	"strconv"
	"time"

	"github.com/commonsyllabi/explorer/api/models"
	zero "github.com/commonsyllabi/explorer/logger"
	"github.com/gin-gonic/gin"
)

func AllUsers(c *gin.Context) {
	syllabi, err := models.GetAllSyllabi()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error getting syllabi: %v", err)
		return
	}

	bytes, err := json.Marshal(syllabi)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error marshalling users: %v", err)
		return
	}

	c.JSON(http.StatusOK, string(bytes))
}

func NewUser(c *gin.Context) {

	err := sanitizeUser(c)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	// save the actual User
	var user models.User
	err = c.Bind(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	user, err = models.AddNewUser(&user)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error creating User: %v", err)
		return
	}

	c.JSON(http.StatusOK, user)
}

func UpdateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	var user models.User
	err = c.Bind(&user)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.UpdatedAt = time.Now()

	_, err = models.UpdateUser(id, &user)
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

	user, err := models.GetUser(id)
	if err != nil {
		zero.Errorf("error getting User %v: %s", id, err)
		c.JSON(http.StatusOK, gin.H{
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

	err = models.DeleteUser(id)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error getting User %d: %v", id, err)
		return
	}

	//-- TODO delete any associated resources?

	c.JSON(http.StatusOK, gin.H{
		"id": id,
	})
}

func sanitizeUser(c *gin.Context) error {

	if c.PostForm("email") == "" {
		zero.Error("Cannot have empty email")
		return fmt.Errorf("cannot have empty title, description or email")

	}

	if len(c.PostForm("email")) < 10 && len(c.PostForm("email")) > 50 {
		zero.Errorf("the email of the User should be between 10 and 50 characters: %d", len(c.PostForm("email")))
		return fmt.Errorf("the email of the User should be between 10 and 50 characters: %d", len(c.PostForm("email")))
	}

	_, err := mail.ParseAddress(c.PostForm("email"))
	return err
}
