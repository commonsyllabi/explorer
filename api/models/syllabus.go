package models

import (
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Syllabus struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	UUID      uuid.UUID      `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	Status    string         `gorm:"default:unlisted" json:"status" form:"status"`

	UserUUID     uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"user_uuid" yaml:"user_uuid"`
	User         User          `gorm:"foreignKey:UserUUID;references:UUID" json:"user"`
	Collections  []*Collection `gorm:"many2many:collections_syllabi;" json:"collections"`
	Attachments  []Attachment  `gorm:"foreignKey:SyllabusUUID;references:UUID" json:"attachments"`
	Institutions []Institution `gorm:"many2many:inst_syllabi;" json:"institutions"`

	AcademicFields   pq.Int32Array  `gorm:"type:integer[];" json:"academic_fields" yaml:"academic_fields" form:"academic_fields[]"`
	AcademicField    string         `gorm:"" json:"academic_field" yaml:"academic_field" form:"academic_field"`
	AcademicLevel    int            `json:"academic_level" yaml:"academic_level" form:"academic_level"`
	Assignments      pq.StringArray `gorm:"type:text[]" json:"assignments" form:"assignments[]"`
	Description      string         `gorm:"not null" json:"description" form:"description"`
	Duration         int            `json:"duration" form:"duration"`
	GradingRubric    string         `json:"grading_rubric" form:"grading_rubric"`
	Language         string         `json:"language" form:"language"`
	LearningOutcomes pq.StringArray `gorm:"type:text[]" json:"learning_outcomes" form:"learning_outcomes[]"`
	License          string         `json:"license" yaml:"license" form:"license"`
	Other            string         `json:"other" form:"other"`
	Readings         pq.StringArray `gorm:"type:text[]" json:"readings" form:"readings[]"`
	Tags             pq.StringArray `gorm:"type:text[]" json:"tags" yaml:"tags" form:"tags[]"`
	Slug             string         `gorm:"" json:"slug"`
	Title            string         `gorm:"not null" form:"title" json:"title"`
	Instructors      pq.StringArray `gorm:"type:text[]" form:"instructors[]" json:"instructors"`
	TopicOutlines    pq.StringArray `gorm:"type:text[]" json:"topic_outlines" form:"topic_outlines[]"`
}

type IFormData struct {
	Institutions     []Institution `json:"institutions"`
	Title            string        `json:"title"`
	CourseNumber     string        `json:"course_number"`
	Description      string        `json:"description"`
	Attachments      []Attachment  `json:"attachments"`
	Tags             []string      `json:"tags"`
	Language         string        `json:"language"`
	LearningOutcomes []string      `json:"learning_outcomes"`
	TopicOutlines    []string      `json:"topic_outlines"`
	Readings         []string      `json:"readings"`
	GradingRubric    string        `json:"grading_rubric"`
	Assignments      []string      `json:"assignments"`
	Other            string        `json:"other"`
	Status           string        `json:"status"`
	AcademicFields   []string      `json:"academic_fields"`
	AcademicLevel    int           `json:"academic_level"`
	Duration         int           `json:"duration"`
}

// the BeforeCreate GORM hook is used to set defaults for academic fields and tags
// and to generate the slug based on the title

func (s *Syllabus) BeforeCreate(tx *gorm.DB) (err error) {
	if len(s.AcademicFields) == 0 {
		s.AcademicFields = []int32{000}
	}

	if len(s.Tags) == 0 {
		s.Tags = []string{}
	}

	sp := strings.Split(slug.Make(s.Title), "-")
	i := math.Min(float64(len(sp)), 5)

	s.Slug = fmt.Sprintf("%s-%s", strings.Join(sp[:int(i)], "-"), s.UUID.String()[:8])

	return nil
}

func (s *Syllabus) IsEmpty() bool {
	return (len(s.AcademicFields) == 0) && s.AcademicLevel == 0 && len(s.Assignments) == 0 && s.Description == "" && s.Duration == 0 && s.GradingRubric == "" && s.Language == "" && len(s.LearningOutcomes) == 0 && s.Other == "" && len(s.Readings) == 0 && len(s.Tags) == 0 && s.Title == "" && len(s.TopicOutlines) == 0 && len(s.Instructors) == 0 && s.AcademicField == ""
}

func CreateSyllabus(syll *Syllabus, user_uuid uuid.UUID) (Syllabus, error) {
	user, err := GetUser(user_uuid, user_uuid)
	if err != nil {
		return *syll, err
	}

	err = db.Model(&user).Association("Syllabi").Append(syll)
	if err != nil {
		return *syll, err
	}

	created, err := GetSyllabus(syll.UUID, user_uuid)
	return created, err
}

const PAGINATION_LIMIT = 15

func GetSyllabus(uuid uuid.UUID, user_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Preload("User").Preload("Attachments").Preload("Institutions").Where("uuid = ? AND (status = 'listed' OR user_uuid = ?)", uuid, user_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var colls []Collection
	err := db.Model(&syll).Association("Collections").Find(&colls)
	if err != nil {
		return syll, err
	}

	for _, c := range colls {
		if c.Status == "listed" || c.UserUUID == user_uuid {
			syll.Collections = append(syll.Collections, &c)
		}
	}

	return syll, nil
}

func GetSyllabusBySlug(slug string, user_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Preload("User").Preload("Attachments").Where("slug = ? AND (status = 'listed' OR user_uuid = ?)", slug, user_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var insts []Institution
	err := db.Model(&syll).Association("Institutions").Find(&insts)
	if err != nil {
		return syll, err
	}

	syll.Institutions = append(syll.Institutions, insts...)

	var colls []Collection
	err = db.Model(&syll).Association("Collections").Find(&colls)
	if err != nil {
		return syll, err
	}

	for _, c := range colls {
		if c.Status == "listed" || c.UserUUID == user_uuid {
			syll.Collections = append(syll.Collections, &c)
		}
	}

	return syll, nil
}

// -- GetSyllabiFilters returns the total number of listed syllabi, and the number of available pages
// -- along with necessary filter params to further query
func GetSyllabiFilters() (map[string]interface{}, error) {
	var filters = make(map[string]interface{})

	// select distinct from
	var syllabi []Syllabus
	res := db.Where("status = 'listed'").Find(&syllabi)
	if res.Error != nil {
		return filters, res.Error
	}
	total_syllabi := int(res.RowsAffected)
	pages := (total_syllabi / PAGINATION_LIMIT) + 1

	var languages []string
	res = db.Model(Syllabus{}).Distinct("language").Find(&languages)
	if res.Error != nil {
		return filters, res.Error
	}

	var levels []string
	res = db.Model(Syllabus{}).Distinct("academic_level").Find(&levels)
	if res.Error != nil {
		return filters, res.Error
	}

	var rawFields []string
	res = db.Model(Syllabus{}).Distinct("academic_fields").Find(&rawFields)
	if res.Error != nil {
		return filters, res.Error
	}

	// todo: isn't this slow af?
	var fields []string
	for _, f := range rawFields {
		// cleanup string into slice
		f = f[1 : len(f)-1]
		fs := strings.Split(f, ",")

		// append if not present
		for _, s := range fs {
			isPresent := false
			for _, field := range fields {
				if s == field {
					isPresent = true
				}
			}

			if !isPresent {
				fields = append(fields, s)
			}
		}
	}

	var years []string
	res = db.Model(Institution{}).Distinct("date_year").Find(&years)
	if res.Error != nil {
		return filters, res.Error
	}

	filters["total_syllabi"] = total_syllabi
	filters["total_pages"] = pages
	filters["languages"] = languages
	filters["academic_levels"] = levels
	filters["academic_fields"] = fields
	filters["academic_years"] = years

	return filters, nil
}

func GetSyllabi(params map[string]any, user_uuid uuid.UUID) ([]Syllabus, error) {
	var syllabi []Syllabus

	page := (params["page"].(int) - 1) * PAGINATION_LIMIT
	if page < 0 {
		page = 0
	}

	//-- TODO: we removed server-side pagination for now
	result := db.Where("language SIMILAR TO ? AND (lower(description) SIMILAR TO ? OR lower(title) SIMILAR TO ?) AND ARRAY_TO_STRING(tags, ' ') SIMILAR TO ? AND academic_level::TEXT SIMILAR TO ? AND ARRAY_TO_STRING(academic_fields, ' ') SIMILAR TO ? AND (status = 'listed' OR user_uuid = ?)", params["languages"], params["keywords"], params["keywords"], params["tags"], params["levels"], params["fields"], user_uuid.String()).Preload("User").Preload("Institutions").Preload("Attachments").Find(&syllabi)

	return syllabi, result.Error

}

func UpdateSyllabus(uuid uuid.UUID, user_uuid uuid.UUID, syll *Syllabus) (Syllabus, error) {
	var existing Syllabus
	result := db.Where("uuid = ? AND user_uuid = ?", uuid, user_uuid).First(&existing)
	if result.Error != nil {
		return *syll, result.Error
	}

	result = db.Model(&existing).Where("uuid = ?", uuid).Updates(&syll)
	return existing, result.Error
}

func AddAttachmentToSyllabus(syll_uuid uuid.UUID, att_uuid uuid.UUID, user_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? AND user_uuid = ?", syll_uuid, user_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var att Attachment
	result = db.Where("uuid = ?", att_uuid, user_uuid).First(&att)
	if result.Error != nil {
		return syll, result.Error
	}

	err := db.Model(&syll).Association("Attachments").Append(&att)
	if err != nil {
		return syll, err
	}

	updated, err := GetSyllabus(syll_uuid, user_uuid)
	return updated, err
}

func RemoveAttachmentFromSyllabus(syll_uuid uuid.UUID, att_uuid uuid.UUID, user_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? AND user_uuid = ?", syll_uuid, user_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var att Attachment
	result = db.Where("uuid = ? ", att_uuid).First(&att)
	if result.Error != nil {
		return syll, result.Error
	}

	// err := db.Model(&syll).Association("Attachments").Delete(res)
	fmt.Println("IMPLEMENT ME!") //--  Right now attachments require a syllabus to exist, but it should be independent, only tied to a user, and with a many2many relation to syllabi
	return syll, nil
}

func AddInstitutionToSyllabus(syll_uuid uuid.UUID, user_uuid uuid.UUID, inst *Institution) (Institution, error) {
	var updated Institution
	var syll Syllabus
	result := db.Where("uuid = ? AND user_uuid = ?", syll_uuid, user_uuid).First(&syll)
	if result.Error != nil {
		return updated, result.Error
	}

	err := db.Model(&syll).Association("Institutions").Append(inst)
	if err != nil {
		return updated, err
	}

	updated = syll.Institutions[len(syll.Institutions)-1]
	return updated, err
}

func EditInstitutionToSyllabus(uuid uuid.UUID, inst_uuid uuid.UUID, updated *Institution) (Institution, error) {
	var existing Institution
	result := db.Where("uuid = ?", inst_uuid).First(&existing)
	if result.Error != nil {
		return existing, result.Error
	}

	err := db.Model(&existing).Updates(updated).Error
	if err != nil {
		return existing, err
	}

	return existing, err
}

func RemoveInstitutionFromSyllabus(syll_uuid uuid.UUID, inst_uuid uuid.UUID, user_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? AND user_uuid = ?", syll_uuid, user_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var inst Institution
	result = db.Where("uuid = ? ", inst_uuid).First(&inst)
	if result.Error != nil {
		return syll, result.Error
	}

	err := db.Model(&syll).Association("Institutions").Delete(inst)
	return syll, err
}

func DeleteSyllabus(uuid uuid.UUID, user_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? AND user_uuid = ?", uuid, user_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}
	result = db.Select("Attachments").Where("uuid = ? ", uuid).Delete(&syll)
	return syll, result.Error
}
