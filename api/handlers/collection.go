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

func GetAllCollections(c *gin.Context) {
	collections, err := models.GetAllCollections()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error getting collections: %v", err)
		return
	}

	c.JSON(http.StatusOK, collections)
}

func CreateCollection(c *gin.Context) {
	err := sanitizeCollection(c)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	var coll models.Collection
	err = c.Bind(&coll)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coll.CreatedAt = time.Now()
	coll.UpdatedAt = time.Now()
	coll, err = models.CreateCollection(&coll)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error creating Collection: %v", err)
		return
	}

	c.JSON(http.StatusCreated, coll)
}

func UpdateCollection(c *gin.Context) {
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

	var empty = new(models.Collection)
	var input models.Collection
	err = c.Bind(&input)
	if err != nil || reflect.DeepEqual(&input, empty) {
		zero.Errorf("error binding collection: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//-- get existing entity
	coll, err := models.GetCollection(uid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	//-- then bind with the incoming request
	err = c.Bind(&coll)
	if err != nil {
		zero.Errorf("error binding user: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//-- then do the actual full update
	updated, err := models.UpdateCollection(uid, &coll)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error updating Collection %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func AddCollectionSyllabus(c *gin.Context) {
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

	// check that the syllabus ID is proper
	syll_id := c.PostForm("syllabus_id")
	if len(id) < 25 {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", id)
		return
	}

	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	syll, err := models.GetSyllabus(syll_uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the syllabus.",
		})
		return
	}

	coll, err := models.GetCollection(uid)
	if err != nil {
		zero.Errorf("error getting Collection %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the Collection.",
		})
		return
	}

	coll.Syllabi = append(coll.Syllabi, &syll)
	syll.CollectionID = coll.ID

	updated_syll, err := models.UpdateSyllabus(syll.ID, &syll)
	if err != nil {
		zero.Errorf("error updating syllabus %v: %s", updated_syll, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"msg": "We couldn't complete the update.",
		})
		return
	}

	updated, err := models.UpdateCollection(coll.ID, &coll)
	if err != nil {
		zero.Errorf("error updating collection %v: %s", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"msg": "We couldn't complete the update.",
		})
		return
	}

	c.JSON(http.StatusOK, updated)
}

func GetCollection(c *gin.Context) {
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

	coll, err := models.GetCollection(uid)
	if err != nil {
		zero.Errorf("error getting Collection %v: %s", id, err)
		c.JSON(http.StatusNotFound, uid)
		return
	}

	c.JSON(http.StatusOK, coll)
}

func GetCollectionSyllabi(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	coll, err := models.GetCollection(uid)
	if err != nil {
		zero.Errorf("error getting Collection %v: %s", id, err)
		c.JSON(http.StatusNotFound, id)
		return
	}

	c.JSON(http.StatusOK, coll.Syllabi)
}

func GetCollectionSyllabus(c *gin.Context) {
	coll_id := c.Param("id")
	coll_uid, err := uuid.Parse(coll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, coll_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	syll_id := c.Param("syll_id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, syll_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	_, err = models.GetCollection(coll_uid)
	if err != nil {
		zero.Errorf("error getting Collection %v: %s", coll_id, err)
		c.JSON(http.StatusNotFound, coll_id)
		return
	}

	syll, err := models.GetSyllabus(syll_uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", syll_id, err)
		c.JSON(http.StatusNotFound, syll_id)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func DeleteCollection(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	coll, err := models.DeleteCollection(uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting Collection %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, coll)
}

func RemoveCollectionSyllabus(c *gin.Context) {
	coll_id := c.Param("id")
	coll_uid, err := uuid.Parse(coll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, coll_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	syll_id := c.Param("syll_id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, syll_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	_, err = models.GetCollection(coll_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting collection %d: %v", coll_id, err)
		return
	}

	syll, err := models.GetSyllabus(syll_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", syll_id, err)
		return
	}

	zero.Warn("the way to remove a syllabus from a collection needs to be updated")
	//-- also there is a problem with "omitzero", we cannot unset fields (like setting the UUID to null below, so we do a new())
	syll.CollectionID = uuid.New()
	fmt.Println(syll)
	updated, err := models.UpdateSyllabus(syll.ID, &syll)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error updating syllabus %d: %v", syll_id, err)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func sanitizeCollection(c *gin.Context) error {
	if len(c.PostForm("name")) < 10 || len(c.PostForm("name")) > 50 {
		zero.Errorf("the name of the Collection should be between 10 and 50 characters: %d", len(c.PostForm("name")))
		return fmt.Errorf("the name of the Collection should be between 10 and 50 characters: %d", len(c.PostForm("name")))
	}

	return nil
}
