package handlers

import (
	"fmt"
	"net/http"
	"reflect"
	"time"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
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
			Name: f.Filename,
		}

		res, err := models.CreateResource(&resource)
		if err != nil {
			zero.Warnf("error adding resource: %s", err)
		}
		resources = append(resources, &res)
	}

	zero.Warn("resources not correctly added to syll create")
	// syll.Resources = resources
	c.JSON(http.StatusCreated, syll)
}

func GetSyllabus(c *gin.Context) {
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
	syll, err := models.GetSyllabus(uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the syllabus.",
		})

		return
	}

	c.JSON(http.StatusOK, syll)
}

func AddSyllabusResource(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid syllabus id %d", err)
		return
	}

	res_id := c.PostForm("resource_id")
	res_uid, err := uuid.Parse(res_id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid resource id %d", err)
		return
	}

	syll, err := models.GetSyllabus(uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the syllabus.",
		})
		return
	}

	res, err := models.GetResource(res_uid)
	if err != nil {
		zero.Errorf("error getting Collection %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the resource.",
		})
		return
	}

	syll.Resources = append(syll.Resources, res)
	// res.SyllabusID = syll.ID

	// _, err = models.UpdateResource(res.ID, &res)
	// if err != nil {
	// 	zero.Errorf("error updating resource: %s", err)
	// 	c.JSON(http.StatusInternalServerError, gin.H{
	// 		"msg": "We couldn't complete the update.",
	// 	})
	// 	return
	// }

	updated, err := models.UpdateSyllabus(syll.UUID, &syll)
	if err != nil {
		zero.Errorf("error updating syllabus %v: %s", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"msg": "We couldn't complete the update.",
		})
		return
	}

	c.JSON(http.StatusOK, updated)
}

func GetSyllabusResources(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	coll, err := models.GetSyllabus(uid)
	if err != nil {
		zero.Errorf("error getting Syllabus %v: %s", id, err)
		c.JSON(http.StatusNotFound, id)
		return
	}

	c.JSON(http.StatusOK, coll.Resources)
}

func GetSyllabusResource(c *gin.Context) {
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
		zero.Errorf("not a valid resource id %d", err)
		return
	}

	_, err = models.GetSyllabus(syll_uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", res_id, err)
		c.JSON(http.StatusNotFound, res_id)
		return
	}

	res, err := models.GetResource(res_uid)
	if err != nil {
		zero.Errorf("error getting resource %v: %s", res_id, err)
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

	//-- TODO delete any associated resources?

	c.JSON(http.StatusOK, syll)
}

func RemoveSyllabusResource(c *gin.Context) {
	coll_id := c.Param("id")
	coll_uid, err := uuid.Parse(coll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, coll_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	res_id := c.Param("res_id")
	_, err = uuid.Parse(res_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, res_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	_, err = models.GetSyllabus(coll_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", coll_id, err)
		return
	}

	// res, err := models.GetResource(res_uid)
	// if err != nil {
	// 	c.String(http.StatusNotFound, err.Error())
	// 	zero.Errorf("error getting resource %d: %v", res_id, err)
	// 	return
	// }

	//-- also there is a problem with "omitzero", we cannot unset fields (like setting the UUID to null below, so we do a new())
	// res.SyllabusID = uuid.New()
	// updated, err := models.UpdateResource(res.ID, &res)
	// if err != nil {
	// 	c.String(http.StatusNotFound, err.Error())
	// 	zero.Errorf("error updating resource %d: %v", res_id, err)
	// 	return
	// }

	c.JSON(http.StatusOK, res_id)
}

func sanitizeSyllabus(c *gin.Context) error {
	if len(c.PostForm("title")) < minSyllabusTitleLength ||
		len(c.PostForm("title")) > maxSyllabusTitleLength {
		zero.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
		return fmt.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
	}

	return nil
}
