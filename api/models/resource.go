package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Resource struct {
	gorm.Model

	ResourceID uuid.UUID `gorm:"index:,unique;type:uuid;primaryKey;default:uuid_generate_v4()"`

	Name        string
	Type        string
	Description string
	URL         string

	UserID     uuid.UUID `gorm:"index:,unique"`
	SyllabusID uuid.UUID `gorm:"index:,unique"`
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
