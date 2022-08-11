package handlers

import (
	"crypto/rand"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"reflect"

	"github.com/commonsyllabi/explorer/api/auth"
	"github.com/commonsyllabi/explorer/api/config"
	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func GetAllAttachments(c echo.Context) error {
	attachments, err := models.GetAllAttachments()
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, attachments)
}

func CreateAttachment(c echo.Context) error {
	auth.Authenticate(c)
	conf, ok := c.Get("config").(config.Config)
	if !ok {
		return c.String(http.StatusInternalServerError, "could not parse configuration from context")
	}

	err := sanitizeAttachment(c)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	id := c.QueryParam("syllabus_id")
	syll_id, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	var att models.Attachment
	//-- prepare attachments (could be merged with sanitizeAttachment() ?)
	name := c.FormValue("name")
	desc := c.FormValue("description")
	weblink := c.FormValue("url")
	file, err := c.FormFile("file")
	if err != nil && weblink == "" {
		return c.String(http.StatusBadRequest, fmt.Sprintf("error parsing form file %s", err))
	}

	if weblink == "" {
		if file == nil {
			return c.String(http.StatusBadRequest, "attachment must have either URL or File")
		}

		b := make([]byte, 4)
		rand.Read(b)
		fname := fmt.Sprintf("%x-%s", b, filepath.Base(file.Filename))
		dest := filepath.Join(conf.UploadsDir, fname)
		src, err := file.Open()
		if err != nil {
			return c.String(http.StatusBadRequest, "failed to open file")
		}
		defer src.Close()

		dst, err := os.Create(filepath.Join(dest, file.Filename))
		if err != nil {
			return err
		}
		defer dst.Close()

		if _, err = io.Copy(dst, src); err != nil {
			return c.String(http.StatusBadRequest, fmt.Sprintf("error saving form file %v", err))
		}

		att = models.Attachment{
			Name:        name,
			Description: desc,
			URL:         dest,
			Type:        "file",
		}

	} else {
		if file != nil {
			return c.String(http.StatusBadRequest, "attachment can either have URL or File, not both")
		}

		parsed_url, err := url.Parse(weblink)
		if err != nil {
			return c.String(http.StatusBadRequest, fmt.Sprintf("error parsing weblink %v", err))
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
	}

	return c.JSON(http.StatusCreated, created)
}

func UpdateAttachment(c echo.Context) error {
	auth.Authenticate(c)
	id := c.Param("id")
	if len(id) < 25 {
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	uid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	err = sanitizeAttachment(c)
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}

	var empty = new(models.Attachment)
	var input models.Attachment
	err = c.Bind(&input)
	if err != nil || reflect.DeepEqual(&input, empty) {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	att, err := models.GetAttachment(uid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	}

	err = c.Bind(&att)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	}

	updated, err := models.UpdateAttachment(uid, &att)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, updated)
}

func GetAttachment(c echo.Context) error {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	att, err := models.GetAttachment(uid)
	if err != nil {
		zero.Errorf("error getting Attachment %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the Attachment.",
		})

	}

	return c.JSON(http.StatusOK, att)
}

func DeleteAttachment(c echo.Context) error {
	auth.Authenticate(c)
	id := c.Param("id")
	if len(id) < 25 {
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	uid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	att, err := models.DeleteAttachment(uid)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, att)
}

func sanitizeAttachment(c echo.Context) error {
	if len(c.FormValue("name")) < 5 || len(c.FormValue("name")) > 50 {
		return fmt.Errorf("the name of the Attachment should be between 10 and 50 characters: %d", len(c.FormValue("name")))
	}

	return nil
}
