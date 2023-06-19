package handlers

import (
	"crypto/rand"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
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
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	conf, ok := c.Get("config").(config.Config)
	if !ok {
		zero.Error("Could not parse configuration from context")
		return c.String(http.StatusInternalServerError, "There was an error uploading your syllabus. Please try again later.")
	}

	err := sanitizeAttachment(c)
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
		src, err := file.Open()
		if err != nil {
			zero.Error(err.Error())
			return c.String(http.StatusBadRequest, "Failed to open file.")
		}
		defer src.Close()

		if os.Getenv("API_MODE") == "release" {
			s3key := os.Getenv("SPACES_ACCESS_KEY")
			if s3key == "" {
				zero.Error("missing spaces access key env var")
				return c.String(http.StatusInternalServerError, "Failed to upload file.")
			}
			s3secret := os.Getenv("SPACES_SECRET_KEY")
			if s3secret == "" {
				zero.Error("missing spaces access secret env var")
				return c.String(http.StatusInternalServerError, "Failed to upload file.")
			}
			s3endpoint := os.Getenv("STORAGE_URL")
			if s3key == "" {
				zero.Error("missing spaces endpoint env var")
				return c.String(http.StatusInternalServerError, "Failed to upload file.")
			}

			s3config := &aws.Config{
				Credentials:      credentials.NewStaticCredentials(s3key, s3secret, ""),
				Endpoint:         aws.String(s3endpoint),
				S3ForcePathStyle: aws.Bool(false),
				Region:           aws.String("us-east-1"),
			}

			newSession, err := session.NewSession(s3config)
			if err != nil {
				zero.Error(err.Error())
				return c.String(http.StatusInternalServerError, "Failed to upload file.")
			}
			s3client := s3.New(newSession)

			object := s3.PutObjectInput{
				Bucket: aws.String("cosyll"),
				Key:    aws.String(fmt.Sprintf("%s/%s", "uploads", fname)),
				Body:   src,
				ACL:    aws.String("public-read"),
			}

			_, err = s3client.PutObject(&object)
			if err != nil {
				zero.Error(err.Error())
				return c.String(http.StatusInternalServerError, "Failed to upload file.")
			}
		} else {
			dest := filepath.Join(conf.UploadsDir, fname)
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

		updated_url := ""
		parsed_url, err := url.Parse(weblink)
		if err != nil {
			zero.Warn(err.Error())
		} else {
			updated_url = parsed_url.String()
		}

		att = models.Attachment{
			Name:        name,
			Description: desc,
			URL:         updated_url,
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
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	conf, ok := c.Get("config").(config.Config)
	if !ok {
		zero.Error("Could not parse configuration from context")
		return c.String(http.StatusInternalServerError, "There was an error uploading your syllabus. Please try again later.")
	}

	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid ID")
	}

	_, err = models.GetAttachment(uid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "Not a valid ID")
	}

	err = sanitizeAttachment(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	var att models.Attachment
	name := c.FormValue("name")
	desc := c.FormValue("description")
	weblink := c.FormValue("url")
	file, err := c.FormFile("file")
	if err != nil && weblink == "" {
		if err != nil {
			zero.Warn(err.Error())
		} else {
			zero.Warn("no file or url found on updated attachment")
		}
	}

	if weblink == "" && file != nil {
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
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
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
	min := 4
	max := 100
	if len(c.FormValue("name")) < min || len(c.FormValue("name")) > max {
		return fmt.Errorf("the name of the Attachment should be between %d and %d characters: %d", min, max, len(c.FormValue("name")))
	}

	return nil
}
