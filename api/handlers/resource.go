package handlers

import (
	"fmt"
	"net/http"
	"time"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetAllResources(c *gin.Context) {
	resources, err := models.GetAllResources()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error getting resources: %v", err)
		return
	}

	c.JSON(http.StatusOK, resources)
}

func CreateResource(c *gin.Context) {
	err := sanitizeResource(c)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	var res models.Resource
	err = c.Bind(&res)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res.CreatedAt = time.Now()
	res.UpdatedAt = time.Now()
	res, err = models.CreateResource(&res)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error creating Resource: %v", err)
		return
	}

	c.JSON(http.StatusCreated, res)
}

func UpdateResource(c *gin.Context) {
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

	err = sanitizeResource(c)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Error(err.Error())
		return
	}

	var input models.Resource
	err = c.Bind(&input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := models.GetResource(uid)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	err = c.Bind(&res)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := models.UpdateResource(uid, &res)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error updating Resource %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func GetResource(c *gin.Context) {
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

	res, err := models.GetResource(uid)
	if err != nil {
		zero.Errorf("error getting Resource %v: %s", id, err)
		c.JSON(http.StatusNotFound, gin.H{
			"msg": "We couldn't find the Resource.",
		})

		return
	}

	c.JSON(http.StatusOK, res)
}

func DeleteResource(c *gin.Context) {
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

	res, err := models.DeleteResource(uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting Resource %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, res)
}

func sanitizeResource(c *gin.Context) error {
	if len(c.PostForm("name")) < 10 || len(c.PostForm("name")) > 50 {
		zero.Errorf("the name of the Resource should be between 10 and 50 characters: %d", len(c.PostForm("name")))
		return fmt.Errorf("the name of the Resource should be between 10 and 50 characters: %d", len(c.PostForm("name")))
	}

	return nil
}
