package handlers

import (
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"strings"

	"github.com/commonsyllabi/explorer/api/auth"
	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/commonsyllabi/explorer/mailer"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func GetAllUsers(c echo.Context) error {
	users, err := models.GetAllUsers()
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, users)
}

func CreateUser(c echo.Context) error {
	err := sanitizeUserCreate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	var user models.User
	err = c.Bind(&user)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "There was an error creating your account. Please try again later.")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(c.FormValue("password")), bcrypt.DefaultCost)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error generating the hash for the password. Please try again later.")
	}
	user.Password = hashed

	user, err = models.CreateUser(&user)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There already is a user with this email address. Try to login instead?")
	}

	token, err := models.CreateToken(user.UUID)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error completing your account creation. Please try again later.")
	}

	var host string
	if os.Getenv("API_MODE") == "release" {
		host = "https://explorer.common-syllabi.org"
	} else {
		host = "http://localhost:3000"
	}

	payload := mailer.ConfirmationPayload{
		Name:  user.Name,
		Host:  host,
		Token: token.UUID.String(),
	}

	if os.Getenv("API_MODE") != "test" {
		err = mailer.SendMail(user.Email, "Welcome to Common Syllabi!", "account_confirmation", payload)
		if err != nil {
			zero.Warnf(err.Error())
		}
	}

	return c.JSON(http.StatusCreated, user)
}

func UpdateUser(c echo.Context) error {
	requester_uid, err := auth.Authenticate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusUnauthorized, "unauthorized")
	}
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid ID.")
	}

	err = sanitizeUserUpdate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	_, err = models.GetUser(uid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "We could not find the requested user.")
	}

	var user models.User
	err = c.Bind(&user)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "There was an error getting the update data.")
	}

	updated, err := models.UpdateUser(uid, uuid.MustParse(requester_uid), &user)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error updating the user.")
	}

	return c.JSON(http.StatusOK, updated)
}

func AddUserInstitution(c echo.Context) error {
	requester_uid, err := auth.Authenticate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	user_id := c.Param("id")
	user_uid, err := uuid.Parse(user_id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid ID")
	}

	var inst models.Institution
	err = c.Bind(&inst)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "We had a problem binding your information, please check it again.")
	}

	syll, err := models.AddInstitutionToUser(user_uid, uuid.MustParse(requester_uid), &inst)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "We had a problem adding the Institution to the User profile.")
	}

	return c.JSON(http.StatusOK, syll)
}

func GetUser(c echo.Context) error {
	slug := c.Param("id")
	if len(slug) < 5 || !strings.Contains(slug, "-") {
		zero.Warnf("Not a valid slug: %v", slug)
	}

	user, err := models.GetUserBySlug(slug)
	if err == nil {
		return c.JSON(http.StatusOK, user)
	}

	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid ID")
	}

	user, err = models.GetUser(uid)
	if err != nil {
		zero.Errorf("error getting User %v: %s", id, err)
		c.String(http.StatusNotFound, "We couldn't find the User.")
	}

	return c.JSON(http.StatusOK, user)

}

func RemoveUserInstitution(c echo.Context) error {
	requester_uid, err := auth.Authenticate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	user_id := c.Param("id")
	user_uid, err := uuid.Parse(user_id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid user ID.")
	}

	inst_id := c.Param("inst_id")
	inst_uid, err := uuid.Parse(inst_id)
	if err != nil {
		zero.Error(err.Error())
		return c.JSON(http.StatusBadRequest, "Not a valid institution ID.")
	}

	syll, err := models.RemoveInstitutionFromUser(user_uid, inst_uid, uuid.MustParse(requester_uid))
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error removing the Institution.")
	}

	return c.JSON(http.StatusOK, syll)
}

func DeleteUser(c echo.Context) error {
	requester_uid, err := auth.Authenticate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusUnauthorized, "unauthorized")
	}
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid ID.")
	}

	user, err := models.DeleteUser(uid, uuid.MustParse(requester_uid))
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "Error finding the user to delete.")
	}

	if os.Getenv("API_MODE") != "test" {
		data := mailer.DeletionPayload{
			Name: user.Name,
		}
		mailer.SendMail(user.Email, "Account deleted", "account_deleted", data)
	}

	return c.JSON(http.StatusOK, user)
}

func sanitizeUserCreate(c echo.Context) error {
	pw := fmt.Sprintf("%v", c.FormValue("password"))
	if len(pw) < 8 || len(pw) > 20 {
		zero.Error("the password should be between 8 and 20 characters")
		return fmt.Errorf("the password should be between 8 and 20 characters")
	}

	_, err := mail.ParseAddress(c.FormValue("email"))
	return err
}

func sanitizeUserUpdate(c echo.Context) error {
	if c.FormValue("email") != "" {
		_, err := mail.ParseAddress(c.FormValue("email"))
		if err != nil {
			zero.Error(err.Error())
			return err
		}
	}

	return nil
}
