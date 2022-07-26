package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Collection struct {
	gorm.Model
	UUID   uuid.UUID `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	Status string    `gorm:"default:unlisted"`
	//-- belongs to a user
	UserUUID uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"user_uuid" yaml:"user_uuid"`
	User     User      `gorm:"foreignKey:UserUUID;references:UUID"`
	Name     string    `gorm:"not null" json:"name" form:"name" binding:"required"`

	Syllabi []Syllabus `gorm:"many2many:collection_syllabi;"`
}

func CreateCollection(user_uuid uuid.UUID, coll *Collection) (Collection, error) {
	user, err := GetUser(user_uuid)
	if err != nil {
		return *coll, err
	}

	err = db.Model(&user).Association("Collections").Append(coll)
	return *coll, err
}

func GetCollection(uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Where("uuid = ?", uuid).First(&coll)
	return coll, result.Error
}

func GetAllCollections() ([]Collection, error) {
	coll := make([]Collection, 0)
	result := db.Find(&coll)
	return coll, result.Error
}

func UpdateCollection(uuid uuid.UUID, coll *Collection) (Collection, error) {
	var existing Collection
	result := db.Where("uuid = ?", uuid).First(&existing)
	if result.Error != nil {
		return *coll, result.Error
	}

	result = db.Model(&existing).Where("uuid = ?", uuid).Updates(&coll)
	return existing, result.Error
}

func DeleteCollection(uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Where("uuid = ?", uuid).First(&coll)
	if result.Error != nil {
		return coll, result.Error
	}

	result = db.Where("uuid = ?", uuid).Delete(&coll)
	return coll, result.Error
}
