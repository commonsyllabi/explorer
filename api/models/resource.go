package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Resource struct {
	gorm.Model
	UUID uuid.UUID `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	//-- belongs to a syllabus
	SyllabusUUID uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"syllabus_uuid" yaml:"syllabus_uuid"`
	Syllabus     Syllabus  `gorm:"foreignKey:SyllabusUUID;references:UUID"`

	Name        string `gorm:"not null" json:"name" form:"name"`
	Type        string `gorm:"not null" json:"type" form:"type"`
	Description string `json:"description" form:"description"`
	URL         string `gorm:"not null" json:"url" form:"url"`
}

func CreateResource(syllabus_uuid uuid.UUID, res *Resource) (Resource, error) {
	syll, err := GetSyllabus(syllabus_uuid)
	if err != nil {
		return *res, err
	}

	res.Syllabus = syll
	err = db.Model(&syll).Association("Resources").Append(res)
	return *res, err
}

func GetResource(uuid uuid.UUID) (Resource, error) {
	var res Resource
	result := db.Where("uuid = ?", uuid).First(&res)
	return res, result.Error
}

func GetAllResources() ([]Resource, error) {
	res := make([]Resource, 0)
	result := db.Find(&res)
	return res, result.Error
}

func UpdateResource(uuid uuid.UUID, res *Resource) (Resource, error) {
	var existing Resource
	result := db.Where("uuid = ?", uuid).First(&existing)
	if result.Error != nil {
		return *res, result.Error
	}

	res.UpdatedAt = time.Now()
	result = db.Model(&existing).Where("uuid = ?", uuid).Updates(res)
	return existing, result.Error
}

func DeleteResource(uuid uuid.UUID) (Resource, error) {
	var res Resource
	result := db.Where("uuid = ?", uuid).First(&res)
	if result.Error != nil {
		return res, result.Error
	}

	result = db.Where("uuid = ? ", uuid).Delete(&res)
	return res, result.Error
}
