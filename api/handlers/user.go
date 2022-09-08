package handlers

import (
	"fmt"
	"net/http"
	"net/mail"
	"os"

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
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, users)
}

func CreateUser(c echo.Context) error {
	err := sanitizeUserCreate(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	var user models.User
	err = c.Bind(&user)
	if err != nil {
		zero.Errorf("error binding user: %v", err)
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(c.FormValue("password")), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}
	user.Password = hashed

	user, err = models.CreateUser(&user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	token, err := models.CreateToken(user.UUID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	var host string
	if os.Getenv("API_MODE") == "release" {
		host = "https://explorer.common-syllabi.org"
	} else {
		host = "http://localhost:3000"
	}

	htmlBody := fmt.Sprintf(`
		<html>
		<body>
		<h1>Welcome, %s!</h1>
		<p>Your account on Common Syllabi Explorer has been successfully created. You just need to confirm it by clicking on this link:</p>
		<p>
		<a href="%s/auth/confirm?token=%s">Confirm your account</a>
		</p>
		<p>Cheers,<br/>
		The Common Syllabi team</p>
		</body>
		</html>
		`, user.Name, host, token.UUID)

	if os.Getenv("API_MODE") != "test" {
		err = mailer.SendMail(user.Email, "Welcome to Common Syllabi!", htmlBody)
		if err != nil {
			zero.Warn(err.Error())
		}
	}

	return c.JSON(http.StatusCreated, user)
}

func UpdateUser(c echo.Context) error {
	requester_uid, err := auth.Authenticate(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	err = sanitizeUserUpdate(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	_, err = models.GetUser(uid)
	if err != nil {
		return c.JSON(http.StatusNotFound, err)
	}

	var user models.User
	err = c.Bind(&user)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	updated, err := models.UpdateUser(uid, uuid.MustParse(requester_uid), &user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, updated)
}

func AddUserInstitution(c echo.Context) error {
	requester_uid, err := auth.Authenticate(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	user_id := c.Param("id")
	user_uid, err := uuid.Parse(user_id)
	if err != nil {
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	var inst models.Institution
	c.Bind(&inst)

	syll, err := models.AddInstitutionToUser(user_uid, uuid.MustParse(requester_uid), &inst)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, syll)
}

func GetUser(c echo.Context) error {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	user, err := models.GetUser(uid)
	if err != nil {
		zero.Errorf("error getting User %v: %s", id, err)
		c.String(http.StatusNotFound, "We couldn't find the User.")
	}

	return c.JSON(http.StatusOK, user)

}

func RemoveUserInstitution(c echo.Context) error {
	requester_uid, err := auth.Authenticate(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	user_id := c.Param("id")
	user_uid, err := uuid.Parse(user_id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, user_id)

	}

	inst_id := c.Param("inst_id")
	inst_uid, err := uuid.Parse(inst_id)
	if err != nil {
		return c.JSON(http.StatusBadRequest, inst_id)
	}

	syll, err := models.RemoveInstitutionFromUser(user_uid, inst_uid, uuid.MustParse(requester_uid))
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, syll)
}

func DeleteUser(c echo.Context) error {
	requester_uid, err := auth.Authenticate(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	user, err := models.DeleteUser(uid, uuid.MustParse(requester_uid))
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	if os.Getenv("API_MODE") != "test" {
		body := fmt.Sprintf(`
		<html>
		<body>
		<h1>Sorry to see you go, %s!</h1>
		<p>Your account was successfully deleted.</p>
		<p>Cheers,<br/>
		The Common Syllabi team</p>
		</body>
		</html>
		`, user.UUID)
		mailer.SendMail(user.Email, "Account deleted", body)
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
			return err
		}
	}

	return nil
}
