package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Collection struct {
	gorm.Model
	UUID   uuid.UUID `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	Status string    `gorm:"default:unlisted" json:"status"`

	UserUUID uuid.UUID   `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"user_uuid" yaml:"user_uuid"`
	User     User        `gorm:"foreignKey:UserUUID;references:UUID" json:"user"`
	Syllabi  []*Syllabus `gorm:"many2many:collections_syllabi;" json:"syllabi"`

	Name string `gorm:"not null" json:"name" form:"name" binding:"required"`
}

func CreateCollection(user_uuid uuid.UUID, coll *Collection) (Collection, error) {
	user, err := GetUser(user_uuid)
	if err != nil {
		return *coll, err
	}

	err = db.Model(&user).Association("Collections").Append(coll)
	if err != nil {
		return *coll, err
	}

	created, err := GetCollection(coll.UUID)
	return created, err
}

func GetCollection(uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Preload("User").Where("uuid = ?", uuid).First(&coll)
	if result.Error != nil {
		return coll, result.Error
	}

	var syllabi []Syllabus
	err := db.Model(&coll).Association("Syllabi").Find(&syllabi)
	for _, s := range syllabi {
		coll.Syllabi = append(coll.Syllabi, &s)
	}

	return coll, err
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

func AddSyllabusToCollection(coll_uuid uuid.UUID, syll_uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Where("uuid = ? ", coll_uuid).First(&coll)
	if result.Error != nil {
		return coll, result.Error
	}

	var syll Syllabus
	result = db.Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return coll, result.Error
	}

	err := db.Model(&coll).Association("Syllabi").Append(&syll)
	return coll, err
}

func RemoveSyllabusFromCollection(coll_uuid uuid.UUID, syll_uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Where("uuid = ? ", coll_uuid).First(&coll)
	if result.Error != nil {
		return coll, result.Error
	}

	var syll Syllabus
	result = db.Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return coll, result.Error
	}

	err := db.Model(&coll).Association("Attachments").Delete(syll)
	return coll, err
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
