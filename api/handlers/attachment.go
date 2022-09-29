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
	"strings"

	"github.com/commonsyllabi/explorer/api/auth"
	"github.com/commonsyllabi/explorer/api/config"
	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func GetAllAttachments(c echo.Context) error {
	attachments, err := models.GetAllAttachments()
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, attachments)
}

func CreateAttachment(c echo.Context) error {
	user_uuid, err := auth.Authenticate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}

	conf, ok := c.Get("config").(config.Config)
	if !ok {
		zero.Error("Could not parse configuration from context")
		return c.String(http.StatusInternalServerError, "There was an error uploading your syllabus. Please try again later.")
	}

	err = sanitizeAttachment(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	id := c.QueryParam("syllabus_id")
	syll_id, err := uuid.Parse(id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Could not find the associated syllabus.")
	}

	var att models.Attachment
	name := c.FormValue("name")
	desc := c.FormValue("description")
	weblink := c.FormValue("url")
	file, err := c.FormFile("file")
	if err != nil && weblink == "" {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Error parsing attached File or URL.")
	}

	if weblink == "" {
		if file == nil {
			zero.Error("attachment must have either URL or File")
			return c.String(http.StatusBadRequest, "Attachment must have either URL or File.")
		}

		b := make([]byte, 4)
		rand.Read(b)
		fname := fmt.Sprintf("%x-%s", b, filepath.Base(file.Filename))
		dest := filepath.Join(conf.UploadsDir, fname)
		src, err := file.Open()
		if err != nil {
			zero.Error(err.Error())
			return c.String(http.StatusBadRequest, "Failed to open file.")
		}
		defer src.Close()

		target, err := os.Create(dest)
		if err != nil {
			zero.Error(err.Error())
			return err
		}
		defer target.Close()

		if _, err = io.Copy(target, src); err != nil {
			zero.Error(err.Error())
			return c.String(http.StatusBadRequest, "Error saving File to disk.")
		}

		att = models.Attachment{
			Name:        name,
			Description: desc,
			URL:         fname,
			Type:        "file",
		}

	} else {
		if file != nil {
			zero.Error("Attachment can have either URL or File, not both.")
			return c.String(http.StatusBadRequest, "attachment can either have URL or File, not both")
		}

		parsed_url, err := url.Parse(weblink)
		if err != nil {
			zero.Error(err.Error())
			return c.String(http.StatusBadRequest, "Error parsing weblink as URL.")
		}

		att = models.Attachment{
			Name:        name,
			Description: desc,
			URL:         parsed_url.String(),
			Type:        "weblink",
		}
	}

	created, err := models.CreateAttachment(syll_id, &att, user_uuid)
	if err != nil {
		zero.Errorf("error creating Attachment: %v", err)
		return c.String(http.StatusInternalServerError, "Error linking the attachment to the syllabus.")
	}

	return c.JSON(http.StatusCreated, created)
}

func UpdateAttachment(c echo.Context) error {
	user_uuid, err := auth.Authenticate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}

	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid ID")
	}

	err = sanitizeAttachment(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	var empty = new(models.Attachment)
	var input models.Attachment
	err = c.Bind(&input)
	if err != nil || reflect.DeepEqual(&input, empty) {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "There was a problem creating your attachment, please make sure all fields are valid.")
	}

	att, err := models.GetAttachment(uid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "We couldn't find the Attachment to update.")
	}

	err = c.Bind(&att)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "We could not parse the update data.")
	}

	updated, err := models.UpdateAttachment(uid, user_uuid, &att)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Failed to update attachment, please try again later")
	}

	return c.JSON(http.StatusOK, updated)
}

func GetAttachment(c echo.Context) error {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		if len(id) < 5 || !strings.Contains(id, "-") {
			zero.Error(err.Error())
			return c.String(http.StatusBadRequest, "Not a valid ID")
		}

		att, err := models.GetAttachmentBySlug(id)
		if err != nil {
			return c.String(http.StatusNotFound, "There was an error getting the requested Attachment.")
		}
		return c.JSON(http.StatusOK, att)
	}

	att, err := models.GetAttachment(uid)
	if err != nil {
		zero.Errorf("Error getting Attachment %v: %s", id, err)
		return c.String(http.StatusNotFound, "We couldn't find the Attachment.")
	}

	return c.JSON(http.StatusOK, att)
}

func DeleteAttachment(c echo.Context) error {
	user_uuid, err := auth.Authenticate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid ID")
	}

	att, err := models.DeleteAttachment(uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error deleting the attachments.")
	}

	return c.JSON(http.StatusOK, att)
}

func sanitizeAttachment(c echo.Context) error {
	if len(c.FormValue("name")) < 5 || len(c.FormValue("name")) > 150 {
		return fmt.Errorf("the name of the Attachment should be between 10 and 50 characters: %d", len(c.FormValue("name")))
	}

	return nil
}
