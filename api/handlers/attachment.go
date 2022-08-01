package handlers

import (
	"crypto/rand"
	"fmt"
	"net/http"
	"net/url"
	"path/filepath"
	"reflect"

	"github.com/commonsyllabi/explorer/api/config"
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
	conf, ok := c.Keys["config"].(config.Config)
	if !ok {
		c.String(http.StatusInternalServerError, "could not parse configuration from context")
		zero.Error("could not parse conf from context")
		return
	}

	err := sanitizeAttachment(c)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	id := c.Query("syllabus_id")
	syll_id, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	var att models.Attachment
	//-- prepare attachments (could be merged with sanitizeAttachment() ?)
	name := c.PostForm("name")
	desc := c.PostForm("description")
	weblink := c.PostForm("url")
	file, err := c.FormFile("file")
	if err != nil && weblink == "" {
		c.String(http.StatusBadRequest, "error parsing form file %s", err)
		zero.Errorf("error parsing form file: %s", err)
		return
	}

	if weblink == "" {
		if file == nil {
			c.String(http.StatusBadRequest, "attachment must have either URL or File")
			zero.Error("attachment must have either URL or File")
			return
		}

		b := make([]byte, 4)
		rand.Read(b)
		fname := fmt.Sprintf("%x-%s", b, filepath.Base(file.Filename))
		dest := filepath.Join(conf.UploadsDir, fname)
		err = c.SaveUploadedFile(file, dest)
		if err != nil {
			c.String(http.StatusBadRequest, "error saving form file %v", err)
			zero.Errorf("error saving form file: %v", err)
			return
		}

		att = models.Attachment{
			Name:        name,
			Description: desc,
			URL:         dest,
			Type:        "file",
		}

	} else {
		if file != nil {
			c.String(http.StatusBadRequest, "attachment can either have URL or File, not both")
			zero.Error("attachment can either have URL or File, not both")
			return
		}

		parsed_url, err := url.Parse(weblink)
		if err != nil {
			c.String(http.StatusBadRequest, "error parsing weblink %v", err)
			zero.Errorf("error parsing weblink: %v", err)
			return
		}

		att = models.Attachment{
			Name:        name,
			Description: desc,
			URL:         parsed_url.String(),
			Type:        "weblink",
		}
	}

	created, err := models.CreateAttachment(syll_id, &att)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		zero.Errorf("error creating Attachment: %v", err)
		return
	}

	c.JSON(http.StatusCreated, created)
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

	att, err := models.GetAttachment(uid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	err = c.Bind(&att)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := models.UpdateAttachment(uid, &att)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error updating Attachment %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func GetAttachment(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	att, err := models.GetAttachment(uid)
	if err != nil {
		zero.Errorf("error getting Attachment %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the Attachment.",
		})

		return
	}

	c.JSON(http.StatusOK, att)
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

	att, err := models.DeleteAttachment(uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting Attachment %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, att)
}

func sanitizeAttachment(c *gin.Context) error {
	if len(c.PostForm("name")) < 5 || len(c.PostForm("name")) > 50 {
		return fmt.Errorf("the name of the Attachment should be between 10 and 50 characters: %d", len(c.PostForm("name")))
	}

	return nil
}
