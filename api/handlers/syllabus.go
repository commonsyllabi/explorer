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
	searchParams := make(map[string]string, 0)
	searchParams["fields"] = "%"
	searchParams["keywords"] = "%"
	searchParams["language"] = "%"
	searchParams["level"] = "%"
	searchParams["tags"] = "%"

	fields := c.Query("fields")
	fields = strings.Trim(fields, " ")
	all_fields := strings.Split(fields, ",")
	if len(all_fields) > 0 {
		for i := range all_fields {
			all_fields[i] = strings.Trim(all_fields[i], " ")
		}
		searchParams["fields"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_fields, "|"))
	}

	kws := c.Query("keywords")
	kws = strings.Trim(kws, " ")
	all_kws := strings.Split(kws, ",")
	if len(all_kws) > 0 {
		for i := range all_kws {
			all_kws[i] = strings.Trim(all_kws[i], " ")
		}
		searchParams["keywords"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_kws, "|"))
	} else {
		zero.Warnf("not enough keywords: %v", all_kws)
	}

	tags := c.Query("tags")
	tags = strings.Trim(tags, " ")
	all_tags := strings.Split(tags, ",")
	if len(all_tags) > 0 {
		for i := range all_tags {
			all_tags[i] = strings.Trim(all_tags[i], " ")
		}
		searchParams["tags"] = fmt.Sprintf("%%(%s)%%", strings.Join(all_tags, "|"))
	} else {
		zero.Warnf("not enough tags: %v", kws)
	}

	lang := c.Query("language")
	if lang != "" {
		_, err := language.Parse(lang)
		if err != nil {
			c.JSON(http.StatusBadRequest, err)
			zero.Errorf("language is not bcp-47 compliant: %v", err)
			return
		}
		searchParams["language"] = lang
	}

	level := c.Query("level")
	if level != "" {
		l, err := strconv.Atoi(level)
		if err != nil {
			c.JSON(http.StatusBadRequest, err)
			zero.Errorf("the level of the syllabus should be between 0 and 3: %v", err)
			return
		}
		_, found := models.LEVELS[l]
		if !found {
			c.JSON(http.StatusBadRequest, err)
			zero.Errorf("the level of the syllabus should be between 0 and 3: %v", err)
			return
		}

		searchParams["level"] = fmt.Sprintf("%d", l)
	}

	syllabi, err := models.GetSyllabi(searchParams)
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
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, err)
		zero.Errorf("not a valid id %d", err)
		return
	}
	syll, err := models.GetSyllabus(uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", id, err)
		c.JSON(http.StatusNotFound, err)

		return
	}

	c.JSON(http.StatusOK, syll)
}

func AddSyllabusAttachment(c *gin.Context) {
	syll_id := c.Param("id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid syllabus id %d", err)
		return
	}

	res_id := c.PostForm("attachment_id")
	res_uid, err := uuid.Parse(res_id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid attachment id %d", err)
		return
	}

	syll, err := models.AddAttachmentToSyllabus(syll_uid, res_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", syll_id, err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func AddSyllabusInstitution(c *gin.Context) {
	syll_id := c.Param("id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid syllabus id %d", err)
		return
	}

	var inst models.Institution
	c.Bind(&inst)
	//-- bind this from the post body

	syll, err := models.AddInstitutionToSyllabus(syll_uid, &inst)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", syll_id, err)
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
	syll_id := c.Param("id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, syll_id)
		zero.Errorf("not a valid syllabus id %d", err)
		return
	}

	res_id := c.Param("res_id")
	res_uid, err := uuid.Parse(res_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, res_id)
		zero.Errorf("not a valid attachment id %d", err)
		return
	}

	_, err = models.GetSyllabus(syll_uid)
	if err != nil {
		zero.Errorf("error getting syllabus %v: %s", res_id, err)
		c.JSON(http.StatusNotFound, res_id)
		return
	}

	res, err := models.GetAttachment(res_uid)
	if err != nil {
		zero.Errorf("error getting attachment %v: %s", res_id, err)
		c.JSON(http.StatusNotFound, res_id)
		return
	}

	c.JSON(http.StatusOK, res)
}

func UpdateSyllabus(c *gin.Context) {
	id := c.Param("id")
	uid, err := uuid.Parse(id)
	if err != nil {
		c.String(http.StatusBadRequest, "not a valid ID")
		zero.Errorf("not a valid id %d", err)
		return
	}

	err = sanitizeSyllabusUpdate(c)
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
		zero.Errorf("error updating syllabus %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, updated)
}

func DeleteSyllabus(c *gin.Context) {
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
	syll, err := models.DeleteSyllabus(uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error deleting syllabus %d: %v", id, err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func RemoveSyllabusAttachment(c *gin.Context) {
	syll_id := c.Param("id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, syll_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	res_id := c.Param("res_id")
	res_uid, err := uuid.Parse(res_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, res_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	syll, err := models.RemoveAttachmentFromSyllabus(syll_uid, res_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", syll_id, err)
		return
	}

	c.JSON(http.StatusOK, syll)
}

func RemoveSyllabusInstitution(c *gin.Context) {
	syll_id := c.Param("id")
	syll_uid, err := uuid.Parse(syll_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, syll_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	inst_id := c.Param("inst_id")
	inst_uid, err := uuid.Parse(inst_id)
	if err != nil {
		c.JSON(http.StatusBadRequest, inst_id)
		zero.Errorf("not a valid id %d", err)
		return
	}

	syll, err := models.RemoveInstitutionFromSyllabus(syll_uid, inst_uid)
	if err != nil {
		c.String(http.StatusNotFound, err.Error())
		zero.Errorf("error getting syllabus %d: %v", syll_id, err)
		return
	}

	c.JSON(http.StatusOK, syll)
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
	if len(title) < minSyllabusTitleLength ||
		len(title) > maxSyllabusTitleLength {
		zero.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(title))
		return fmt.Errorf("the title of the syllabus should be between 10 and 200 characters: %d", len(title))
	}

	lang := c.PostForm("language")
	if lang != "" {
		_, err := language.Parse(lang)
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
