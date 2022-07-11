package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"
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
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	var coll models.Collection
	err = c.Bind(&coll)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coll.UpdatedAt = time.Now()
	_, err = models.UpdateCollection(int64(id), &coll)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error updating Collection %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, coll)
}

func GetCollection(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	coll, err := models.GetCollection(int64(id))
	if err != nil {
		zero.Errorf("error getting Collection %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the Collection.",
		})

		return
	}

	c.JSON(http.StatusOK, coll)
}

func DeleteCollection(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	err = models.DeleteCollection(int64(id))
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting Collection %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": id})
}

func sanitizeCollection(c *gin.Context) error {
	if len(c.PostForm("name")) < 10 || len(c.PostForm("name")) > 50 {
		zero.Errorf("the name of the Collection should be between 10 and 50 characters: %d", len(c.PostForm("name")))
		return fmt.Errorf("the name of the Collection should be between 10 and 50 characters: %d", len(c.PostForm("name")))
	}

	return nil
}
