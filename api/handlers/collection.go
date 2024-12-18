package handlers

import (
	"fmt"
	"net/http"
	"reflect"
	"strings"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func GetAllCollections(c echo.Context) error {
	user_uuid := mustGetUser(c)
	collections, err := models.GetAllCollections(user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error getting the Collections.")
	}

	return c.JSON(http.StatusOK, collections)
}

func CreateCollection(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	err := sanitizeCollection(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Please check your input information.")
	}

	var coll models.Collection
	err = c.Bind(&coll)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "There was an error parsing your input information.")
	}

	coll, err = models.CreateCollection(&coll, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error creating the Collection.")
	}

	return c.JSON(http.StatusCreated, coll)
}

func UpdateCollection(c echo.Context) error {
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

	var empty = new(models.Collection)
	var input models.Collection
	err = c.Bind(&input)
	if err != nil || reflect.DeepEqual(&input, empty) {
		zero.Errorf("There was an error binding the update input %v", err)
		return c.String(http.StatusBadRequest, "There was an error parsing the updated information.")
	}

	coll, err := models.GetCollection(uid, user_uuid)
	if err != nil {
		return c.String(http.StatusNotFound, "We couldn't find the Collection to update.")
	}

	err = c.Bind(&coll)
	if err != nil {
		return c.String(http.StatusBadRequest, "Error binding to the Collection to update.")
	}

	updated, err := models.UpdateCollection(uid, user_uuid, &coll)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error updating the Collection. Please try again later.")
	}

	return c.JSON(http.StatusOK, updated)
}

func AddCollectionSyllabus(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	coll_id := c.Param("id")
	coll_uid, err := uuid.Parse(coll_id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid Collection ID.")
	}

	syll_id := c.FormValue("syllabus_id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid Syllabus ID.")
	}

	coll, err := models.AddSyllabusToCollection(coll_uid, syll_uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "We couldn't add the Syllabus to the Collection.")
	}

	return c.JSON(http.StatusOK, coll)
}

func GetCollection(c echo.Context) error {
	user_uuid := mustGetUser(c)
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		if len(id) < 5 || !strings.Contains(id, "-") {
			zero.Error(err.Error())
			return c.String(http.StatusBadRequest, "Not a valid ID")
		}

		coll, err := models.GetCollectionBySlug(id, user_uuid)
		if err != nil {
			return c.String(http.StatusNotFound, "There was an error getting the requested Collection.")
		}
		return c.JSON(http.StatusOK, coll)

	}

	coll, err := models.GetCollection(uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "We couldn't find the Collection.")
	}

	return c.JSON(http.StatusOK, coll)
}

func GetCollectionSyllabi(c echo.Context) error {
	user_uuid := mustGetUser(c)
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	coll, err := models.GetCollection(uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "We couldn't find the Collection.")
	}

	return c.JSON(http.StatusOK, coll.Syllabi)
}

func GetCollectionSyllabus(c echo.Context) error {
	// authenticating to return unlisted but owned syllabi
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	coll_id := c.Param("id")
	coll_uid, err := uuid.Parse(coll_id)
	if err != nil {
		return c.String(http.StatusBadRequest, "Not a valid Collection ID.")
	}

	syll_id := c.Param("syll_id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		return c.String(http.StatusBadRequest, "Not a valid Syllabus ID.")
	}

	_, err = models.GetCollection(coll_uid, user_uuid)
	if err != nil {
		return c.String(http.StatusNotFound, "We couldn't find the Collection.")
	}

	syll, err := models.GetSyllabus(syll_uid, user_uuid)
	if err != nil {
		return c.String(http.StatusBadRequest, "We couldn't find the Syllabus.")
	}

	return c.JSON(http.StatusOK, syll)
}

func DeleteCollection(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "Not a valid ID")
	}

	coll, err := models.DeleteCollection(uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error deleting the Collection.")
	}

	return c.JSON(http.StatusOK, coll)
}

func RemoveCollectionSyllabus(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	coll_id := c.Param("id")
	coll_uid, err := uuid.Parse(coll_id)
	if err != nil {
		zero.Error(err.Error())
		return c.JSON(http.StatusBadRequest, "Not a valid Collection ID.")
	}

	syll_id := c.Param("syll_id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, "Not a valid Syllabus ID.")
	}

	updated, err := models.RemoveCollectionSyllabus(coll_uid, syll_uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error updating the Collection.")
	}

	return c.JSON(http.StatusOK, updated)
}

func sanitizeCollection(c echo.Context) error {
	if len(c.FormValue("name")) < 10 || len(c.FormValue("name")) > 50 {
		zero.Errorf("the name of the Collection should be between 10 and 50 characters: %d", len(c.FormValue("name")))
		return fmt.Errorf("the name of the Collection should be between 10 and 50 characters: %d", len(c.FormValue("name")))
	}

	return nil
}
