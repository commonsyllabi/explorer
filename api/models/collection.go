package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Collection struct {
	gorm.Model
	CollectionID uuid.UUID `gorm:"index:,unique;type:uuid;primaryKey;default:uuid_generate_v4()"`
	Status       string    `gorm:"default:unlisted"`

	Name string `json:"name" form:"name" binding:"required"`

	Syllabi []Syllabus `gorm:"many2many:collection_syllabi;"`
	UserID  uuid.UUID  `gorm:"index:,unique"`
}

func CreateCollection(coll *Collection) (Collection, error) {
	result := db.Create(coll)
	return *coll, result.Error
}

func GetCollection(id uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.First(&coll, id)
	return coll, result.Error
}

func GetAllCollections() ([]Collection, error) {
	coll := make([]Collection, 0)
	result := db.Find(&coll)
	return coll, result.Error
}

func UpdateCollection(id uuid.UUID, coll *Collection) (Collection, error) {
	existing := new(Collection)
	result := db.First(existing, id)
	if result.Error != nil {
		return *coll, result.Error
	}

	coll.UpdatedAt = time.Now()
	result = db.Model(Collection{}).Where("id = ?", id).Updates(coll)
	return *coll, result.Error
}

func DeleteCollection(id uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.First(&coll, id)
	if result.Error != nil {
		return coll, result.Error
	}

	result = db.Delete(&coll, id)
	return coll, result.Error
}
