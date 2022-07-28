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
	Status string    `gorm:"default:unlisted"`

	//-- belongs to a user
	UserUUID uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"user_uuid" yaml:"user_uuid"`
	User     User      `gorm:"foreignKey:UserUUID;references:UUID"`

	//-- many collections to many syllabus
	Collections []*Collection `gorm:"many2many:collections_syllabi;"`

	//-- has many resources
	Resources []Resource `gorm:"foreignKey:SyllabusUUID;references:UUID"`

	Title         string `gorm:"not null" form:"title"`
	Description   string `gorm:"not null" form:"description"`
	Duration      int    `json:"duration" form:"duration"`
	GradingRubric string `json:"grading_rubric" form:"grading_rubric"`

	// Institutions []struct {
	// 	Country string //-- iso 3166
	// 	Date    struct {
	// 		Term string
	// 		Year int
	// 	}
	// 	Name string
	// 	URL  string
	// }

	LearningOutcomes pq.StringArray `gorm:"type:text[]" json:"learning_outcomes" form:"learning_outcomes[]"`
	Other            string         `json:"other" form:"other"`
	Readings         pq.StringArray `gorm:"type:text[]" json:"readings" form:"readings[]"`
	Tags             pq.StringArray `gorm:"type:text[]" json:"tags" form:"tags[]"`
	TopicOutlines    pq.StringArray `gorm:"type:text[]" json:"topic_outlines" form:"topic_outlines[]"`
}

func CreateSyllabus(user_uuid uuid.UUID, syll *Syllabus) (Syllabus, error) {
	user, err := GetUser(user_uuid)
	if err != nil {
		return *syll, err
	}

	err = db.Model(&user).Association("Syllabi").Append(syll)
	return *syll, err
}

func GetSyllabus(uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", uuid).First(&syll)
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

func AddResourceToSyllabus(syll_uuid uuid.UUID, res_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var res Resource
	result = db.Where("uuid = ? ", res_uuid).First(&res)
	if result.Error != nil {
		return syll, result.Error
	}

	err := db.Model(&syll).Association("Resources").Append(&res)
	return syll, err
}

func RemoveResourceFromSyllabus(syll_uuid uuid.UUID, res_uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}

	var res Resource
	result = db.Where("uuid = ? ", res_uuid).First(&res)
	if result.Error != nil {
		return syll, result.Error
	}

	// err := db.Model(&syll).Association("Resources").Delete(res)
	fmt.Println("IMPLEMENT ME!") //--  Right now resources require a syllabus to exist, but it should be independent, only tied to a user, and with a many2many relation to syllabi
	return syll, nil
}

func DeleteSyllabus(uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}
	result = db.Where("uuid = ? ", uuid).Delete(&syll)
	return syll, result.Error
}
