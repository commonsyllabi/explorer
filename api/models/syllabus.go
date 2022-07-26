package models

import (
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
	Collections []*Collection `gorm:"many2many:collection_syllabi;"`

	//-- has many resources
	Resources []Resource `gorm:"foreignKey:SyllabusUUID;references:UUID"`

	Title         string `gorm:"not null"`
	Description   string `gorm:"not null"`
	Duration      int
	GradingRubric string

	// Institutions []struct {
	// 	Country string //-- iso 3166
	// 	Date    struct {
	// 		Term string
	// 		Year int
	// 	}
	// 	Name string
	// 	URL  string
	// }

	LearningOutcomes pq.StringArray `gorm:"type:text[]"`
	Other            string
	Readings         pq.StringArray `gorm:"type:text[]"`
	Tags             pq.StringArray `gorm:"type:text[]"`
	TopicOutlines    pq.StringArray `gorm:"type:text[]"`
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

func DeleteSyllabus(uuid uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.Where("uuid = ? ", uuid).First(&syll)
	if result.Error != nil {
		return syll, result.Error
	}
	result = db.Where("uuid = ? ", uuid).Delete(&syll)
	return syll, result.Error
}
