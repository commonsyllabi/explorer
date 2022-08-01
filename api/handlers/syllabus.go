package handlers

import (
	"fmt"
	"net/http"
	"reflect"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var (
	minSyllabusTitleLength = 10
	maxSyllabusTitleLength = 100
)

func GetAllSyllabi(c *gin.Context) {
	syllabi, err := models.GetAllSyllabi()
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		zero.Errorf("error getting syllabi: %v", err)
		return
	}

	c.JSON(http.StatusOK, syllabi)
}

func CreateSyllabus(c *gin.Context) {
	err := sanitizeSyllabus(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Error(err.Error())
		return
	}

	var syll models.Syllabus
	err = c.Bind(&syll)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	var userID uuid.UUID
	if gin.Mode() != gin.TestMode { //-- todo: handle this properly (ask tobi)
		session := sessions.Default(c)
		sessionID := session.Get("user")
		userID = uuid.MustParse(fmt.Sprintf("%v", sessionID))
	} else {
		userID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a8")
	}

	syll, err = models.CreateSyllabus(userID, &syll)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		zero.Errorf("error creating syllabus: %v", err)
		return
	}

	c.JSON(http.StatusCreated, syll)
}

func GetSyllabus(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Errorf("not a valid id %d", err)
		return
	}
	syll, err := models.GetSyllabus(uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", id, err)
		c.JSON(http.StatusNotFound, err)

		return
	}

	c.JSON(http.StatusOK, syll)
}

func AddSyllabusAttachment(c *gin.Context) {
	syll_id := c.Param("id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid syllabus id %d", err)
		return
	}

	res_id := c.PostForm("attachment_id")
	res_uid, err := uuid.Parse(res_id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid attachment id %d", err)
		return
	}

	syll, err := models.AddAttachmentToSyllabus(syll_uid, res_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", syll_id, err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func GetSyllabusAttachments(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	syll, err := models.GetSyllabus(uid)
	if err != nil {
		zero.Errorf("error getting Syllabus %v: %s", id, err)
		c.JSON(http.StatusNotFound, id)
		return
	}

	c.JSON(http.StatusOK, syll.Attachments)
}

func GetSyllabusAttachment(c *gin.Context) {
	syll_id := c.Param("id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, syll_id)
		zero.Errorf("not a valid syllabus id %d", err)
		return
	}

	res_id := c.Param("res_id")
	res_uid, err := uuid.Parse(res_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, res_id)
		zero.Errorf("not a valid attachment id %d", err)
		return
	}

	_, err = models.GetSyllabus(syll_uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", res_id, err)
		c.JSON(http.StatusNotFound, res_id)
		return
	}

	res, err := models.GetAttachment(res_uid)
	if err != nil {
		zero.Errorf("error getting attachment %v: %s", res_id, err)
		c.JSON(http.StatusNotFound, res_id)
		return
	}

	c.JSON(http.StatusOK, res)
}

func UpdateSyllabus(c *gin.Context) {
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

	err = sanitizeSyllabus(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		zero.Error(err.Error())
		return
	}

	var empty = new(models.Syllabus)
	var input models.Syllabus
	err = c.Bind(&input)
	if err != nil || reflect.DeepEqual(&input, empty) { // deep equal checks for wrong input fields
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	syll, err := models.GetSyllabus(uid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	err = c.Bind(&syll)
	if err != nil {
		zero.Errorf("error binding syllabus: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := models.UpdateSyllabus(uid, &syll)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error updating syllabus %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func DeleteSyllabus(c *gin.Context) {
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
	syll, err := models.DeleteSyllabus(uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error deleting syllabus %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func RemoveSyllabusAttachment(c *gin.Context) {
	syll_id := c.Param("id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, syll_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	res_id := c.Param("res_id")
	res_uid, err := uuid.Parse(res_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, res_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	syll, err := models.RemoveAttachmentFromSyllabus(syll_uid, res_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", syll_id, err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func sanitizeSyllabus(c *gin.Context) error {
	if len(c.PostForm("title")) < minSyllabusTitleLength ||
		len(c.PostForm("title")) > maxSyllabusTitleLength {
		zero.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
		return fmt.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
	}

	return nil
}
