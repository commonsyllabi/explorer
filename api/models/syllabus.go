package models

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type Syllabus struct {
	gorm.Model
	UUID   uuid.UUID `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	Status string    `gorm:"default:unlisted" json:"status"`

	UserUUID    uuid.UUID     `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"user_uuid" yaml:"user_uuid"`
	User        User          `gorm:"foreignKey:UserUUID;references:UUID" json:"user"`
	Collections []*Collection `gorm:"many2many:collections_syllabi;" json:"collections"`
	Attachments []Attachment  `gorm:"foreignKey:SyllabusUUID;references:UUID" json:"attachments"`

	// Institutions []struct {
	// 	Country string //-- iso 3166
	// 	Date    struct {
	// 		Term string
	// 		Year int
	// 	}
	// 	Name string
	// 	URL  string
	// }

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
	return syll, result.Error
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

func AddAttachmentToSyllabus(syll_uuid uuid.UUID, res_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var att Attachment
	result = db.Where("uuid = ? ", res_uuid).First(&att)
	if result.Error != nil {
		return syll, result.Error
	}

	err := db.Model(&syll).Association("Attachments").Append(&att)
	return syll, err
}

func RemoveAttachmentFromSyllabus(syll_uuid uuid.UUID, res_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var att Attachment
	result = db.Where("uuid = ? ", res_uuid).First(&att)
	if result.Error != nil {
		return syll, result.Error
	}

	// err := db.Model(&syll).Association("Attachments").Delete(res)
	fmt.Println("IMPLEMENT ME!") //--  Right now attachments require a syllabus to exist, but it should be independent, only tied to a user, and with a many2many relation to syllabi
	return syll, nil
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
