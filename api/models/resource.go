package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Resource struct {
	gorm.Model
	UUID uuid.UUID `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	//-- belongs to a user
	SyllabusUUID uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"syllabus_uuid" yaml:"syllabus_uuid"`
	Syllabus     Syllabus  `gorm:"foreignKey:SyllabusUUID;references:UUID"`

	Name        string `gorm:"not null"`
	Type        string `gorm:"not null"`
	Description string
	URL         string `gorm:"not null"`
}

func CreateResource(res *Resource) (Resource, error) {
	result := db.Create(res)
	return *res, result.Error
}

func GetResource(id uuid.UUID) (Resource, error) {
	var res Resource
	result := db.First(&res, id)
	return res, result.Error
}

func GetAllResources() ([]Resource, error) {
	res := make([]Resource, 0)
	result := db.Find(&res)
	return res, result.Error
}

func UpdateResource(id uuid.UUID, res *Resource) (Resource, error) {
	existing := new(Resource)
	result := db.First(&existing, id)
	if result.Error != nil {
		return *res, result.Error
	}

	res.UpdatedAt = time.Now()
	result = db.Model(Resource{}).Where("id = ?", id).Updates(res)
	return *res, result.Error
}

func DeleteResource(id uuid.UUID) (Resource, error) {
	var res Resource
	result := db.First(&res, id)
	if result.Error != nil {
		return res, result.Error
	}

	result = db.Delete(&res, id)
	return res, result.Error
}
