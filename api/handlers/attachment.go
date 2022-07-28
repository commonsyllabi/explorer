package handlers

import (
	"fmt"
	"net/http"
	"reflect"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetAllAttachments(c *gin.Context) {
	attachments, err := models.GetAllAttachments()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error getting attachments: %v", err)
		return
	}

	c.JSON(http.StatusOK, attachments)
}

func CreateAttachment(c *gin.Context) {
	err := sanitizeAttachment(c)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	id, exists := c.Get("syllabus_id")
	syll_id, err := uuid.Parse(fmt.Sprintf("%v", id))
	if !exists || err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf(err.Error())
		return
	}

	var att models.Attachment
	err = c.Bind(&att)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	att, err = models.CreateAttachment(syll_id, &att)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error creating Attachment: %v", err)
		return
	}

	c.JSON(http.StatusCreated, att)
}

func UpdateAttachment(c *gin.Context) {
	id := c.Param("id")
	if len(id) < 25 {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", id)
		return
	}

	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	err = sanitizeAttachment(c)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	var empty = new(models.Attachment)
	var input models.Attachment
	err = c.Bind(&input)
	if err != nil || reflect.DeepEqual(&input, empty) {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := models.GetAttachment(uid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	err = c.Bind(&res)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := models.UpdateAttachment(uid, &res)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error updating Attachment %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func GetAttachment(c *gin.Context) {
	id := c.Param("id")
	if len(id) < 25 {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", id)
		return
	}

	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	res, err := models.GetAttachment(uid)
	if err != nil {
		zero.Errorf("error getting Attachment %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the Attachment.",
		})

		return
	}

	c.JSON(http.StatusOK, res)
}

func DeleteAttachment(c *gin.Context) {
	id := c.Param("id")
	if len(id) < 25 {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", id)
		return
	}

	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	res, err := models.DeleteAttachment(uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting Attachment %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, res)
}

func sanitizeAttachment(c *gin.Context) error {
	if len(c.PostForm("name")) < 10 || len(c.PostForm("name")) > 50 {
		zero.Errorf("the name of the Attachment should be between 10 and 50 characters: %d", len(c.PostForm("name")))
		return fmt.Errorf("the name of the Attachment should be between 10 and 50 characters: %d", len(c.PostForm("name")))
	}

	return nil
}
