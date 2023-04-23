package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/commonsyllabi/explorer/api/auth"
	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"golang.org/x/text/language"
)

var (
	minSyllabusTitleLength       = 3
	maxSyllabusTitleLength       = 150
	minSyllabusDescriptionLength = 15
)

func GetSyllabi(c echo.Context) error {
	user_uuid := mustGetUser(c)

	params, err := parseSearchParams(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "There was an error in parsing your search parameters.")
	}

	syllabi, err := models.GetSyllabi(params, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error getting the syllabi.")
	}

	filters, err := models.GetSyllabiFilters()
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error getting the syllabus count.")
	}

	return c.JSON(http.StatusOK, echo.Map{"syllabi": syllabi, "meta": filters})
}

func CreateSyllabus(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	err := sanitizeSyllabusCreate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	var syll models.Syllabus
	err = c.Bind(&syll)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "There was an error parsing the Syllabus information.")
	}

	if os.Getenv("API_MODE") == "test" {
		user_uuid = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a8")
	}
	syll, err = models.CreateSyllabus(&syll, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error creating the Syllabus.")
	}

	return c.JSON(http.StatusCreated, syll)
}

func GetSyllabus(c echo.Context) error {
	user_uuid := mustGetUser(c)

	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		if len(id) < 5 || !strings.Contains(id, "-") {
			zero.Error(err.Error())
			return c.String(http.StatusBadRequest, "Not a valid ID")
		}

		syll, err := models.GetSyllabusBySlug(id, user_uuid)
		if err != nil {
			return c.String(http.StatusNotFound, "There was an error getting the requested Syllabus.")
		}
		return c.JSON(http.StatusOK, syll)
	}

	syll, err := models.GetSyllabus(uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error getting the requested Syllabus.")
	}

	return c.JSON(http.StatusOK, syll)
}

func AddSyllabusAttachment(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	uid := parseUUIDParam(c, "id")
	att_uid := parseUUIDForm(c, "att_id")
	if uid == uuid.Nil || att_uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}

	syll, err := models.AddAttachmentToSyllabus(uid, att_uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "We couldn't add the  Attachment to the requested Syllabus.")
	}

	return c.JSON(http.StatusOK, syll)
}

func GetSyllabusAttachments(c echo.Context) error {
	// authenticating to return unlisted but owned syllabi
	user_uuid := mustGetUser(c)

	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "Not a valid ID.")
	}

	syll, err := models.GetSyllabus(uid, user_uuid)
	if err != nil {
		return c.String(http.StatusNotFound, "There was an error getting the requested Syllabus.")
	}

	return c.JSON(http.StatusOK, syll.Attachments)
}

func GetSyllabusAttachment(c echo.Context) error {
	user_uuid := mustGetUser(c)

	uid := parseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Not a valid Syllabus ID.")
	}
	att_uid := parseUUIDParam(c, "att_id")
	if att_uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Not a valid Attachment ID.")
	}

	_, err := models.GetSyllabus(uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error verifying that the Syllabus exists.")
	}

	res, err := models.GetAttachment(att_uid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error getting the Attachment.")
	}

	return c.JSON(http.StatusOK, res)
}

func UpdateSyllabus(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	uid := parseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Not a valid ID.")
	}

	err := sanitizeSyllabusUpdate(c)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, err.Error())
	}

	var input models.Syllabus
	err = c.Bind(&input)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "There was an error parsing your Syllabus.")
	}

	if input.IsEmpty() {
		return c.String(http.StatusNoContent, "You must specify at least one field to update the Syllabus.")
	}

	syll, err := models.GetSyllabus(uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error getting the Syllabus.")
	}

	err = c.Bind(&syll)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "There was an error getting the information to update the Syllabus.")
	}

	updated, err := models.UpdateSyllabus(uid, user_uuid, &syll)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "There was an error updating the Syllabus.")
	}

	return c.JSON(http.StatusOK, updated)
}

func DeleteSyllabus(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	uid := parseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}
	syll, err := models.DeleteSyllabus(uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error deleting the Syllabus.")
	}

	return c.JSON(http.StatusOK, syll)
}

func RemoveSyllabusAttachment(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	uid := parseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Not a valid Syllabus ID")
	}
	att_uid := parseUUIDParam(c, "att_id")
	if att_uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Not a valid Attachment ID")
	}

	syll, err := models.RemoveAttachmentFromSyllabus(uid, att_uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error removing the Attachment form the Syllabus.")
	}

	return c.JSON(http.StatusOK, syll)
}

func AddSyllabusInstitution(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	uid := parseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Not a valid ID.")
	}

	var inst models.Institution
	c.Bind(&inst)

	inst, err := models.AddInstitutionToSyllabus(uid, user_uuid, &inst)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error adding the Institution to the Syllabus.")
	}

	return c.JSON(http.StatusOK, inst)
}

func EditSyllabusInstitution(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	owner_id := c.Param("id")
	owner_uuid, err := uuid.Parse(owner_id)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Not a valid ID")
	}

	inst_id := c.Param("inst_id")
	inst_uid, err := uuid.Parse(inst_id)
	if err != nil {
		zero.Error(err.Error())
		return c.JSON(http.StatusBadRequest, "Not a valid institution ID.")
	}

	var inst models.Institution
	err = c.Bind(&inst)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "We had a problem binding your information, please check it again.")
	}

	updated, err := models.EditInstitutionToSyllabus(owner_uuid, inst_uid, &inst)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "We had a problem adding the Institution to the User profile.")
	}

	return c.JSON(http.StatusOK, updated)
}

func RemoveSyllabusInstitution(c echo.Context) error {
	user_uuid := mustGetUser(c)
	if user_uuid == uuid.Nil {
		return c.String(http.StatusUnauthorized, "unauthorized")
	}

	uid := parseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Not a valid Syllabus ID.")
	}
	inst_uid := parseUUIDParam(c, "inst_id")
	if inst_uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Not a valid Institution ID.")
	}

	syll, err := models.RemoveInstitutionFromSyllabus(uid, inst_uid, user_uuid)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusNotFound, "There was an error removing the Institution.")
	}

	return c.JSON(http.StatusOK, syll)
}

func parseSearchParams(c echo.Context) (map[string]any, error) {
	params := make(map[string]any, 0)
	params["page"] = 0
	params["fields"] = "%"
	params["keywords"] = "%"
	params["languages"] = "%"
	params["levels"] = "%"
	params["tags"] = "%"

	p := c.QueryParam("page")
	p = strings.Trim(p, " ")
	page, err := strconv.Atoi(p)
	if err != nil {
		page = 0
	}
	params["page"] = page

	fields := c.QueryParam("fields")
	fields = strings.Trim(fields, " ")
	all_fields := strings.Split(fields, ",")
	if len(all_fields) > 0 && all_fields[0] != "" {
		for i := range all_fields {
			all_fields[i] = strings.Trim(all_fields[i], " ")
			f, err := strconv.Atoi(all_fields[i])
			if err != nil {
				return params, fmt.Errorf("field is not compliant integer: %v", err)
			}
			if _, found := models.ACADEMIC_FIELDS[f]; !found {
				return params, fmt.Errorf("field is not ISCED-F 2013 compliant: %v", err)
			}
		}
		params["fields"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_fields, "|"))
	}

	kws := c.QueryParam("keywords")
	kws = strings.Trim(kws, " ")
	all_kws := strings.Split(kws, ",")
	if len(all_kws) > 0 {
		for i := range all_kws {
			all_kws[i] = strings.Trim(all_kws[i], " ")
			all_kws[i] = strings.ToLower(all_kws[i])
		}
		params["keywords"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_kws, "|"))
	}

	tags := c.QueryParam("tags")
	tags = strings.Trim(tags, " ")
	all_tags := strings.Split(tags, ",")
	if len(all_tags) > 0 {
		for i := range all_tags {
			all_tags[i] = strings.Trim(all_tags[i], " ")
			all_tags[i] = strings.ToLower(all_tags[i])
		}
		params["tags"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_tags, "|"))
	}

	langs := c.QueryParam("languages")
	langs = strings.Trim(langs, " ")
	all_langs := strings.Split(langs, ",")
	if len(all_langs) > 0 {
		for i := range all_langs {
			all_langs[i] = strings.Trim(all_langs[i], " ")
			all_langs[i] = strings.ToLower(all_langs[i])
			if all_langs[i] != "" {
				_, err := language.ParseBase(all_langs[i])
				if err != nil {
					return params, fmt.Errorf("language is not bcp-47 compliant: %v", err)
				}
			}
		}
		params["languages"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_langs, "|"))
	}

	levels := c.QueryParam("levels")
	levels = strings.Trim(levels, " ")
	all_levels := strings.Split(levels, ",")
	if len(all_levels) > 0 {
		for i := range all_levels {
			if all_levels[i] != "" {
				l, err := strconv.Atoi(all_levels[i])
				if err != nil {
					return params, fmt.Errorf("the level of the syllabus should be between 0 and 3: %v", err)
				}
				_, found := models.LEVELS[l]
				if !found {
					return params, fmt.Errorf("the level of the syllabus should be between 0 and 3: %v", err)
				}
			}
		}

		params["levels"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_levels, "|"))
	}

	return params, nil
}

func sanitizeSyllabusCreate(c echo.Context) error {
	title := c.FormValue("title")
	if len(title) < minSyllabusTitleLength ||
		len(title) > maxSyllabusTitleLength {
		return fmt.Errorf("the title must be between %d and %d characters: %d", minSyllabusTitleLength, maxSyllabusTitleLength, len(title))
	}

	description := c.FormValue("description")
	if len(description) < minSyllabusDescriptionLength {
		return fmt.Errorf("the description must be greater than %d characters: %d", minSyllabusDescriptionLength, len(description))
	}

	lang := c.FormValue("language")
	_, err := language.ParseBase(lang)
	if err != nil {
		return fmt.Errorf("the language of the syllabus should be BCP47 compliant: %v", lang)
	}

	l, err := strconv.Atoi(c.FormValue("academic_level"))
	if err != nil {
		return fmt.Errorf("the level of the syllabus should be between 0 and 3: %s", err)
	}
	_, found := models.LEVELS[l]
	if !found {
		return fmt.Errorf("the level of the syllabus should be between 0 and 3")
	}

	return nil
}

func sanitizeSyllabusUpdate(c echo.Context) error {
	title := c.FormValue("title")
	if title != "" && (len(title) < minSyllabusTitleLength ||
		len(title) > maxSyllabusTitleLength) {
		return fmt.Errorf("the title must be between %d and %d characters: %d", minSyllabusTitleLength, maxSyllabusTitleLength, len(c.FormValue("title")))
	}

	lang := c.FormValue("language")
	if lang != "" {
		_, err := language.ParseBase(lang)
		if err != nil {
			return fmt.Errorf("the language of the syllabus should be BCP47 compliant, given '%v'", lang)
		}
	}

	level := c.FormValue("academic_level")
	if level != "" {
		l, err := strconv.Atoi(level)
		if err != nil {
			return fmt.Errorf("the level of the syllabus should be between 0 and 3: %d", l)
		}
		_, found := models.LEVELS[l]
		if !found {
			return fmt.Errorf("the level of the syllabus should be between 0 and 3: %d", l)
		}
	}

	return nil
}

func parseUUIDParam(c echo.Context, tag string) uuid.UUID {
	id := c.Param(tag)
	uid, err := uuid.Parse(id)
	if err != nil {
		return uuid.Nil
	}

	return uid
}

func parseUUIDForm(c echo.Context, tag string) uuid.UUID {
	id := c.FormValue(tag)
	uid, err := uuid.Parse(id)
	if err != nil {
		return uuid.Nil
	}

	return uid
}

func mustGetUser(c echo.Context) uuid.UUID {
	if os.Getenv("API_MODE") == "test" {
		uuid, _ := auth.Authenticate(c)
		return uuid
	}

	if c.Get("user_uuid") == nil {
		return uuid.Nil
	}

	id := fmt.Sprintf("%s", c.Get("user_uuid"))
	uuid := uuid.MustParse(id)
	return uuid
}
