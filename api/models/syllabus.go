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

	UserUUID     uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"user_uuid" yaml:"user_uuid"`
	User         User           `gorm:"foreignKey:UserUUID;references:UUID" json:"user"`
	Collections  []*Collection  `gorm:"many2many:collections_syllabi;" json:"collections"`
	Attachments  []Attachment   `gorm:"foreignKey:SyllabusUUID;references:UUID" json:"attachments"`
	Institutions []*Institution `gorm:"many2many:institutions_syllabi;" json:"institutions"`

	AcademicFields   pq.StringArray `gorm:"type:text[]" json:"academic_fields" form:"academic_fields[]"`
	Assignments      pq.StringArray `gorm:"type:text[]" json:"assignments" form:"assignments[]"`
	Description      string         `gorm:"not null" form:"description" json:"description"`
	Duration         int            `json:"duration" form:"duration"`
	GradingRubric    string         `json:"grading_rubric" form:"grading_rubric"`
	Language         string         `json:"language" form:"language"`
	LearningOutcomes pq.StringArray `gorm:"type:text[]" json:"learning_outcomes" form:"learning_outcomes[]"`
	Other            string         `json:"other" form:"other"`
	Readings         pq.StringArray `gorm:"type:text[]" json:"readings" form:"readings[]"`
	Tags             pq.StringArray `gorm:"type:text[]" json:"tags" form:"tags[]"`
	Title            string         `gorm:"not null" form:"title" json:"title"`
	TopicOutlines    pq.StringArray `gorm:"type:text[]" json:"topic_outlines" form:"topic_outlines[]"`
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

	for _, s := range insts {
		syll.Institutions = append(syll.Institutions, &s)
	}

	return syll, nil
}

func GetAllSyllabi() ([]Syllabus, error) {
	var syllabi []Syllabus
	result := db.Find(&syllabi)
	return syllabi, result.Error
}

func UpdateSyllabus(uuid uuid.UUID, syll *Syllabus) (Syllabus, error) {
	var existing Syllabus
	result := db.Where("uuid = ? ", uuid).First(&existing)
	if result.Error != nil {
		return *syll, result.Error
	}

	result = db.Model(&existing).Where("uuid = ?", uuid).Updates(&syll)
	return existing, result.Error
}

func AddAttachmentToSyllabus(syll_uuid uuid.UUID, att_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var att Attachment
	result = db.Where("uuid = ? ", att_uuid).First(&att)
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

func RemoveAttachmentFromSyllabus(syll_uuid uuid.UUID, att_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", syll_uuid).First(&syll)
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

func AddInstitutionToSyllabus(syll_uuid uuid.UUID, inst *Institution) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	err := db.Model(&syll).Association("Institutions").Append(inst)
	if err != nil {
		return syll, err
	}

	return syll, err
}

func RemoveInstitutionFromSyllabus(syll_uuid uuid.UUID, inst_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", syll_uuid).First(&syll)
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

func DeleteSyllabus(uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}
	result = db.Select("Attachments").Where("uuid = ? ", uuid).Delete(&syll)
	return syll, result.Error
}
