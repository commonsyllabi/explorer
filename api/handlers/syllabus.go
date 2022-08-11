package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/text/language"
)

var (
	minSyllabusTitleLength = 3
	maxSyllabusTitleLength = 100
)

func GetSyllabi(c *gin.Context) {
	params, err := parseSearchParams(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Error(err.Error())
		return
	}

	syllabi, err := models.GetSyllabi(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		zero.Errorf("error getting syllabi: %v", err)
		return
	}

	c.JSON(http.StatusOK, syllabi)
}

func CreateSyllabus(c *gin.Context) {
	err := sanitizeSyllabusCreate(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Error(err.Error())
		return
	}

	var syll models.Syllabus
	err = c.Bind(&syll)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		return
	}

	var userID uuid.UUID
	if gin.Mode() != gin.TestMode { //-- todo: handle this properly (ask tobi)
		session := sessions.Default(c)
		sessionID := session.Get("user")
		userID = uuid.MustParse(fmt.Sprintf("%v", sessionID))
	} else {
		userID = uuid.MustParse("e7b74bcd-c864-41ee-b5a7-d3031f76c8a8")
	}

	syll, err = models.CreateSyllabus(userID, &syll)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err)
		zero.Errorf("error creating syllabus: %v", err)
		return
	}

	c.JSON(http.StatusCreated, syll)
}

func GetSyllabus(c *gin.Context) {
	uid := mustParseUUIDParam(c, "id")
	syll, err := models.GetSyllabus(uid)
	if err != nil {
		zero.Errorf("error getting syllabus: %s", err)
		c.JSON(http.StatusNotFound, err)

		return
	}

	c.JSON(http.StatusOK, syll)
}

func AddSyllabusAttachment(c *gin.Context) {
	uid := mustParseUUIDParam(c, "id")
	att_uid := mustParseUUIDForm(c, "att_id")

	syll, err := models.AddAttachmentToSyllabus(uid, att_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", uid.String(), err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func AddSyllabusInstitution(c *gin.Context) {
	uid := mustParseUUIDParam(c, "id")

	var inst models.Institution
	c.Bind(&inst)

	syll, err := models.AddInstitutionToSyllabus(uid, &inst)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus: %v", err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func GetSyllabusAttachments(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	syll, err := models.GetSyllabus(uid)
	if err != nil {
		zero.Errorf("error getting Syllabus %v: %s", id, err)
		c.JSON(http.StatusNotFound, id)
		return
	}

	c.JSON(http.StatusOK, syll.Attachments)
}

func GetSyllabusAttachment(c *gin.Context) {
	uid := mustParseUUIDParam(c, "id")
	att_uid := mustParseUUIDParam(c, "att_id")

	_, err := models.GetSyllabus(uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", att_uid, err)
		c.JSON(http.StatusNotFound, att_uid.String())
		return
	}

	res, err := models.GetAttachment(att_uid)
	if err != nil {
		zero.Errorf("error getting attachment %v: %s", att_uid, err)
		c.JSON(http.StatusNotFound, att_uid.String())
		return
	}

	c.JSON(http.StatusOK, res)
}

func UpdateSyllabus(c *gin.Context) {
	uid := mustParseUUIDParam(c, "id")

	err := sanitizeSyllabusUpdate(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		zero.Error(err.Error())
		return
	}

	var input models.Syllabus
	err = c.Bind(&input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.IsEmpty() {
		c.String(http.StatusNoContent, "you must specify at least one field to update")
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
		zero.Errorf("error updating syllabus %d: %v", uid.String(), err)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func DeleteSyllabus(c *gin.Context) {
	uid := mustParseUUIDParam(c, "id")
	syll, err := models.DeleteSyllabus(uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error deleting syllabus %d: %v", uid.String(), err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func RemoveSyllabusAttachment(c *gin.Context) {
	uid := mustParseUUIDParam(c, "id")
	att_uid := mustParseUUIDParam(c, "att_id")

	syll, err := models.RemoveAttachmentFromSyllabus(uid, att_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", uid.String(), err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func RemoveSyllabusInstitution(c *gin.Context) {
	uid := mustParseUUIDParam(c, "id")
	inst_uid := mustParseUUIDParam(c, "inst_id")

	syll, err := models.RemoveInstitutionFromSyllabus(uid, inst_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", uid.String(), err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func parseSearchParams(c *gin.Context) (map[string]string, error) {
	params := make(map[string]string, 0)
	params["fields"] = "%"
	params["keywords"] = "%"
	params["languages"] = "%"
	params["levels"] = "%"
	params["tags"] = "%"

	fields := c.Query("fields")
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

	kws := c.Query("keywords")
	kws = strings.Trim(kws, " ")
	all_kws := strings.Split(kws, ",")
	if len(all_kws) > 0 {
		for i := range all_kws {
			all_kws[i] = strings.Trim(all_kws[i], " ")
			all_kws[i] = strings.ToLower(all_kws[i])
		}
		params["keywords"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_kws, "|"))
	}

	tags := c.Query("tags")
	tags = strings.Trim(tags, " ")
	all_tags := strings.Split(tags, ",")
	if len(all_tags) > 0 {
		for i := range all_tags {
			all_tags[i] = strings.Trim(all_tags[i], " ")
			all_tags[i] = strings.ToLower(all_tags[i])
		}
		params["tags"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_tags, "|"))
	}

	langs := c.Query("languages")
	langs = strings.Trim(langs, " ")
	all_langs := strings.Split(langs, ",")
	if len(all_langs) > 0 {
		for i := range all_langs {
			all_langs[i] = strings.Trim(all_langs[i], " ")
			if all_langs[i] != "" {
				_, err := language.Parse(all_langs[i])
				if err != nil {
					return params, fmt.Errorf("language is not bcp-47 compliant: %v", err)
				}
			}
		}
		params["languages"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_langs, "|"))
	}

	levels := c.Query("levels")
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

func sanitizeSyllabusCreate(c *gin.Context) error {
	title := c.PostForm("title")
	if len(title) < minSyllabusTitleLength ||
		len(title) > maxSyllabusTitleLength {
		zero.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
		return fmt.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(c.PostForm("title")))
	}

	lang := c.PostForm("language")
	_, err := language.Parse(lang)
	if err != nil {
		return fmt.Errorf("the language of the syllabus should be BCP47 compliant: %v", lang)
	}

	l, err := strconv.Atoi(c.PostForm("academic_level"))
	if err != nil {
		return fmt.Errorf("the level of the syllabus should be between 0 and 3: %s", err)
	}
	_, found := models.LEVELS[l]
	if !found {
		return fmt.Errorf("the level of the syllabus should be between 0 and 3")
	}

	return nil
}

func sanitizeSyllabusUpdate(c *gin.Context) error {
	title := c.PostForm("title")
	if title != "" && len(title) < minSyllabusTitleLength ||
		len(title) > maxSyllabusTitleLength {
		zero.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(title))
		return fmt.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(title))
	}

	lang := c.PostForm("language")
	if lang != "" {
		_, err := language.ParseBase(lang)
		if err != nil {
			return fmt.Errorf("the language of the syllabus should be BCP47 compliant, given '%v'", lang)
		}
	}

	level := c.PostForm("academic_level")
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

func mustParseUUIDParam(c *gin.Context, tag string) uuid.UUID {
	id := c.Param(tag)
	uid, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Errorf("not a valid id %d", err)
		return uuid.Nil
	}

	return uid
}

func mustParseUUIDForm(c *gin.Context, tag string) uuid.UUID {
	id := c.PostForm(tag)
	uid, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Errorf("not a valid id %d", err)
		return uuid.Nil
	}

	return uid
}
