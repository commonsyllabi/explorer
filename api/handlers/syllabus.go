package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/commonsyllabi/explorer/api/auth"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"golang.org/x/text/language"
)

var (
	minSyllabusTitleLength = 3
	maxSyllabusTitleLength = 100
)

func GetSyllabi(c echo.Context) error {
	params, err := parseSearchParams(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	syllabi, err := models.GetSyllabi(params)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, syllabi)
}

func CreateSyllabus(c echo.Context) error {
	auth.Authenticate(c)
	err := sanitizeSyllabusCreate(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	var syll models.Syllabus
	err = c.Bind(&syll)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	var userID uuid.UUID
	if os.Getenv("API_MODE") == "test" {
		userID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a8")
	}
	syll, err = models.CreateSyllabus(userID, &syll)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusCreated, syll)
}

func GetSyllabus(c echo.Context) error {
	uid := mustParseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}
	syll, err := models.GetSyllabus(uid)
	if err != nil {
		return c.JSON(http.StatusNotFound, err)
	}

	return c.JSON(http.StatusOK, syll)
}

func AddSyllabusAttachment(c echo.Context) error {
	uid := mustParseUUIDParam(c, "id")
	att_uid := mustParseUUIDForm(c, "att_id")
	if uid == uuid.Nil || att_uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}

	syll, err := models.AddAttachmentToSyllabus(uid, att_uid)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, syll)
}

func AddSyllabusInstitution(c echo.Context) error {
	uid := mustParseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}

	var inst models.Institution
	c.Bind(&inst)

	syll, err := models.AddInstitutionToSyllabus(uid, &inst)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, syll)
}

func GetSyllabusAttachments(c echo.Context) error {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		return c.String(http.StatusBadRequest, "not a valid ID")
	}

	syll, err := models.GetSyllabus(uid)
	if err != nil {
		return c.JSON(http.StatusNotFound, id)
	}

	return c.JSON(http.StatusOK, syll.Attachments)
}

func GetSyllabusAttachment(c echo.Context) error {
	uid := mustParseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}
	att_uid := mustParseUUIDParam(c, "att_id")
	if att_uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}

	_, err := models.GetSyllabus(uid)
	if err != nil {
		return c.JSON(http.StatusNotFound, att_uid.String())
	}

	res, err := models.GetAttachment(att_uid)
	if err != nil {
		return c.JSON(http.StatusNotFound, att_uid.String())
	}

	return c.JSON(http.StatusOK, res)
}

func UpdateSyllabus(c echo.Context) error {
	auth.Authenticate(c)
	uid := mustParseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}

	err := sanitizeSyllabusUpdate(c)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	var input models.Syllabus
	err = c.Bind(&input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	fmt.Println(input)

	if input.IsEmpty() {
		return c.String(http.StatusNoContent, "you must specify at least one field to update")
	}

	syll, err := models.GetSyllabus(uid)
	if err != nil {
		return c.JSON(http.StatusNotFound, err)
	}

	err = c.Bind(&syll)
	if err != nil {
		return c.JSON(http.StatusBadRequest, err)
	}

	updated, err := models.UpdateSyllabus(uid, &syll)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, err)
	}

	return c.JSON(http.StatusOK, updated)
}

func DeleteSyllabus(c echo.Context) error {
	auth.Authenticate(c)
	uid := mustParseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}
	syll, err := models.DeleteSyllabus(uid)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, syll)
}

func RemoveSyllabusAttachment(c echo.Context) error {
	uid := mustParseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}
	att_uid := mustParseUUIDParam(c, "att_id")

	syll, err := models.RemoveAttachmentFromSyllabus(uid, att_uid)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, syll)
}

func RemoveSyllabusInstitution(c echo.Context) error {
	uid := mustParseUUIDParam(c, "id")
	if uid == uuid.Nil {
		return c.String(http.StatusBadRequest, "Invalid UUID")
	}
	inst_uid := mustParseUUIDParam(c, "inst_id")

	syll, err := models.RemoveInstitutionFromSyllabus(uid, inst_uid)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}

	return c.JSON(http.StatusOK, syll)
}

func parseSearchParams(c echo.Context) (map[string]string, error) {
	params := make(map[string]string, 0)
	params["fields"] = "%"
	params["keywords"] = "%"
	params["languages"] = "%"
	params["levels"] = "%"
	params["tags"] = "%"

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
		return c.String(http.StatusBadRequest, fmt.Sprintf("the title must be between %d and %d characters: %d", minSyllabusTitleLength, maxSyllabusTitleLength, len(c.FormValue("title"))))
	}

	lang := c.FormValue("language")
	_, err := language.ParseBase(lang)
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("the language of the syllabus should be BCP47 compliant: %v", lang))
	}

	l, err := strconv.Atoi(c.FormValue("academic_level"))
	if err != nil {
		return c.String(http.StatusBadRequest, fmt.Sprintf("the level of the syllabus should be between 0 and 3: %s", err))
	}
	_, found := models.LEVELS[l]
	if !found {
		return c.String(http.StatusBadRequest, "the level of the syllabus should be between 0 and 3")
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

func mustParseUUIDParam(c echo.Context, tag string) uuid.UUID {
	id := c.Param(tag)
	uid, err := uuid.Parse(id)
	if err != nil {
		return uuid.Nil
	}

	return uid
}

func mustParseUUIDForm(c echo.Context, tag string) uuid.UUID {
	id := c.FormValue(tag)
	uid, err := uuid.Parse(id)
	if err != nil {
		return uuid.Nil
	}

	return uid
}
