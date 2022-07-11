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
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	var res models.Resource
	err = c.Bind(&res)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res.UpdatedAt = time.Now()

	_, err = models.UpdateResource(int64(id), &res)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error updating Resource %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, res)
}

func GetResource(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	res, err := models.GetResource(int64(id))
	if err != nil {
		zero.Errorf("error getting Resource %v: %s", id, err)
		c.JSON(http.StatusOK, gin.H{
			"msg": "We couldn't find the Resource.",
		})

		return
	}

	c.JSON(http.StatusOK, res)

}

func DeleteResource(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		zero.Errorf("not a valid id %d", id)
		return
	}

	err = models.DeleteResource(int64(id))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		zero.Errorf("error getting Resource %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id": id,
	})
}

func sanitizeResource(c *gin.Context) error {

	if c.PostForm("name") == "" {
		zero.Error("Cannot have empty name")
		return fmt.Errorf("cannot have empty name")

	}

	if len(c.PostForm("name")) < 10 && len(c.PostForm("name")) > 50 {
		zero.Errorf("the name of the Resource should be between 10 and 50 characters: %d", len(c.PostForm("name")))
		return fmt.Errorf("the name of the Resource should be between 10 and 50 characters: %d", len(c.PostForm("name")))
	}

	return nil
}
