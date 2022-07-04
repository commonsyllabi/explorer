package handlers

import (
	"fmt"
	"net/http"
	"net/mail"
	"strconv"
	"time"

	"github.com/commonsyllabi/explorer/api/models"
	zero "github.com/commonsyllabi/explorer/logger"
	"github.com/gin-gonic/gin"
)

func GetAllSyllabi(c *gin.Context) {
	syllabi, err := models.GetAllSyllabi()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error getting syllabi: %v", err)
		return
	}

	c.JSON(http.StatusOK, syllabi)
}

func CreateSyllabus(c *gin.Context) {

	err := sanitizeSyllabus(c)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	// save the actual syllabus
	var syll models.Syllabus
	err = c.Bind(&syll)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		c.String(http.StatusBadRequest, "error parsing form %v", err)
		zero.Errorf("error parsing form: %v", err)
		return
	}

	syll.CreatedAt = time.Now()
	syll.UpdatedAt = time.Now()

	syll, err = models.CreateSyllabus(&syll)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error creating syllabus: %v", err)
		return
	}

	var resources []models.Resource
	files := form.File["resources[]"]

	zero.Warnf("%d resources found on new syllabus", len(files))

	for _, f := range files {

		//-- todo handle how to store files?
		// file, err := f.Open()
		// if err != nil {
		// 	c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		// 	return
		// }

		// bytes, err := ioutil.ReadAll(file)
		// if err != nil {
		// 	c.String(http.StatusInternalServerError, err.Error())
		// 	zero.Errorf("error reading file into bytes: %v", err)
		// 	return
		// }

		resource := models.Resource{
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
			Name:       f.Filename,
			SyllabusID: syll.ID,
		}

		att, err := models.CreateResource(&resource)
		if err != nil {
			zero.Warnf("error adding resource: %s", err)
		}
		resources = append(resources, att)
	}

	c.JSON(http.StatusOK, gin.H{
		"syllabus":  syll,
		"resources": resources,
	})
}

func UpdateSyllabus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	var syll models.Syllabus
	err = c.Bind(&syll)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	syll.UpdatedAt = time.Now()

	_, err = models.UpdateSyllabus(id, &syll)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error updating syllabus %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func GetSyllabus(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	syll, err := models.GetSyllabus(id)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", id, err)
		c.JSON(http.StatusOK, gin.H{
			"msg": "We couldn't find the syllabus.",
		})

		return
	}

	c.JSON(http.StatusOK, syll)

}

func DeleteSyllabus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	err = models.DeleteSyllabus(id)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error getting syllabus %d: %v", id, err)
		return
	}

	//-- TODO delete any associated resources?

	c.JSON(http.StatusOK, gin.H{
		"id": id,
	})
}

func sanitizeSyllabus(c *gin.Context) error {

	if c.PostForm("title") == "" {
		zero.Error("Cannot have empty title, description or email")
		return fmt.Errorf("cannot have empty title, description or email")

	}

	if len(c.PostForm("title")) < 10 && len(c.PostForm("title")) > 200 {
		zero.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
		return fmt.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
	}

	// if len(c.PostForm("description")) < 10 && len(c.PostForm("description")) > 500 {
	// 	zero.Errorf("the description of the syllabus should be between 10 and 500 characters: %d", len(c.PostForm("description")))
	// 	err = fmt.Errorf("the description of the syllabus should be between 10 and 500 characters: %d", len(c.PostForm("description")))
	// 	return err
	// }

	_, err := mail.ParseAddress(c.PostForm("email"))
	return err
}
