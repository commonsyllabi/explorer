package models

import (
	"time"

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

func CreateSyllabus(syll *Syllabus) (Syllabus, error) {
	result := db.Create(syll)
	return *syll, result.Error
}

func GetSyllabus(id uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.First(&syll, id)
	return syll, result.Error
}

func GetAllSyllabi() ([]Syllabus, error) {
	var syllabi []Syllabus
	result := db.Find(&syllabi)
	return syllabi, result.Error
}

func UpdateSyllabus(id uuid.UUID, syll *Syllabus) (Syllabus, error) {
	existing := new(Syllabus)
	result := db.First(&existing, id)
	if result.Error != nil {
		return *syll, result.Error
	}

	syll.UpdatedAt = time.Now()
	result = db.Model(Syllabus{}).Where("id = ?", id).Updates(syll)
	return *syll, result.Error
}

func DeleteSyllabus(id uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.First(&syll, id)
	if result.Error != nil {
		return syll, result.Error
	}
	result = db.Delete(&syll, id)
	return syll, result.Error
}
