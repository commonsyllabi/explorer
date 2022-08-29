package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Syllabus struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	UUID      uuid.UUID      `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	Status    string         `gorm:"default:unlisted" json:"status"`

	UserUUID     uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"user_uuid" yaml:"user_uuid"`
	User         User          `gorm:"foreignKey:UserUUID;references:UUID" json:"user"`
	Collections  []*Collection `gorm:"many2many:collections_syllabi;" json:"collections"`
	Attachments  []Attachment  `gorm:"foreignKey:SyllabusUUID;references:UUID" json:"attachments"`
	Institutions []Institution `gorm:"many2many:inst_syllabi;" json:"institutions"`

	AcademicFields   pq.Int32Array  `gorm:"type:integer[];" json:"academic_fields" yaml:"academic_fields" form:"academic_fields[]"`
	AcademicLevel    int            `json:"academic_level" yaml:"academic_level" form:"academic_level"`
	Assignments      pq.StringArray `gorm:"type:text[]" json:"assignments" form:"assignments[]"`
	Description      string         `gorm:"not null" json:"description" form:"description"`
	Duration         int            `json:"duration" form:"duration"`
	GradingRubric    string         `json:"grading_rubric" form:"grading_rubric"`
	Language         string         `json:"language" form:"language"`
	LearningOutcomes pq.StringArray `gorm:"type:text[]" json:"learning_outcomes" form:"learning_outcomes[]"`
	Other            string         `json:"other" form:"other"`
	Readings         pq.StringArray `gorm:"type:text[]" json:"readings" form:"readings[]"`
	Tags             pq.StringArray `gorm:"type:text[]" json:"tags" yaml:"tags" form:"tags[]"`
	Title            string         `gorm:"not null" form:"title" json:"title"`
	TopicOutlines    pq.StringArray `gorm:"type:text[]" json:"topic_outlines" form:"topic_outlines[]"`
}

// the BeforeCreate GORM hook is used to set defaults for complex datatypes
func (s *Syllabus) BeforeCreate(tx *gorm.DB) (err error) {
	if len(s.AcademicFields) == 0 {
		s.AcademicFields = []int32{000}
	}

	return nil
}

func (s *Syllabus) IsEmpty() bool {
	return (len(s.AcademicFields) == 0) && s.AcademicLevel == 0 && len(s.Assignments) == 0 && s.Description == "" && s.Duration == 0 && s.GradingRubric == "" && s.Language == "" && len(s.LearningOutcomes) == 0 && s.Other == "" && len(s.Readings) == 0 && len(s.Tags) == 0 && s.Title == "" && len(s.TopicOutlines) == 0
}

func CreateSyllabus(user_uuid uuid.UUID, syll *Syllabus) (Syllabus, error) {
	user, err := GetUser(user_uuid)
	if err != nil {
		return *syll, err
	}

	err = db.Model(&user).Association("Syllabi").Append(syll)
	if err != nil {
		return *syll, err
	}

	created, err := GetSyllabus(syll.UUID)
	return created, err
}

func GetSyllabus(uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Preload("User").Preload("Attachments").Where("uuid = ? ", uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var insts []Institution
	err := db.Model(&syll).Association("Institutions").Find(&insts)
	if err != nil {
		return syll, err
	}

	syll.Institutions = append(syll.Institutions, insts...)

	return syll, nil
}

func GetSyllabi(params map[string]string) ([]Syllabus, error) {
	var syllabi []Syllabus

	result := db.Preload("User").Where("language SIMILAR TO ? AND (lower(description) SIMILAR TO ? OR lower(title) SIMILAR TO ?) AND ARRAY_TO_STRING(tags, ' ') SIMILAR TO ? AND academic_level::TEXT SIMILAR TO ? AND ARRAY_TO_STRING(academic_fields, ' ') SIMILAR TO ?", params["languages"], params["keywords"], params["keywords"], params["tags"], params["levels"], params["fields"]).Find(&syllabi)

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

	updated, err := GetSyllabus(syll_uuid)
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

func AddInstitutionToSyllabus(syll_uuid uuid.UUID, user_uuid uuid.UUID, inst *Institution) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? AND user_uuid = ?", syll_uuid, user_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	err := db.Model(&syll).Association("Institutions").Append(inst)
	if err != nil {
		return syll, err
	}

	return syll, err
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
