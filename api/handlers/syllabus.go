package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/commonsyllabi/explorer/api/models"
	zero "github.com/commonsyllabi/explorer/logger"
	"github.com/gin-gonic/gin"
)

var (
	minSyllabusTitleLength = 10
	maxSyllabusTitleLength = 100
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		zero.Error(err.Error())
		return
	}

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

	var resources []*models.Resource
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

		res, err := models.CreateResource(&resource)
		if err != nil {
			zero.Warnf("error adding resource: %s", err)
		}
		resources = append(resources, &res)
	}

	syll.Resources = resources
	c.JSON(http.StatusCreated, syll)
}

func GetSyllabus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	syll, err := models.GetSyllabus(int64(id))
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", id, err)
		c.JSON(http.StatusOK, gin.H{
			"msg": "We couldn't find the syllabus.",
		})

		return
	}

	c.JSON(http.StatusOK, syll)
}

func UpdateSyllabus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	syll := models.Syllabus{}
	err = c.Bind(&syll)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	syll.UpdatedAt = time.Now()
	fmt.Printf("binding: %+v\n", syll)

	s, err := models.UpdateSyllabus(int64(id), &syll)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error updating syllabus %d: %v", id, err)
		return
	}

	fmt.Printf("returning: %+v\n", s)

	c.JSON(http.StatusOK, s)
}

func DeleteSyllabus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	err = models.DeleteSyllabus(int64(id))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error deleting syllabus %d: %v", id, err)
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
		return fmt.Errorf("cannot have empty title")

	}

	if len(c.PostForm("title")) < minSyllabusTitleLength &&
		len(c.PostForm("title")) > maxSyllabusTitleLength {
		zero.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
		return fmt.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
	}

	return nil
}
