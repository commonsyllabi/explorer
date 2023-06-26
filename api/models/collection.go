package models

import (
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

type Collection struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	UUID      uuid.UUID      `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	Status    string         `gorm:"default:unlisted" json:"status"`

	UserUUID uuid.UUID   `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"user_uuid" yaml:"user_uuid"`
	User     User        `gorm:"foreignKey:UserUUID;references:UUID" json:"user"`
	Syllabi  []*Syllabus `gorm:"many2many:collections_syllabi;" json:"syllabi"`

	Name       string `gorm:"not null" json:"name" form:"name" binding:"required"`
	Collection string `json:"description" form:"description"`
	Slug       string `gorm:"" json:"slug"`
}

func (c *Collection) BeforeCreate(tx *gorm.DB) (err error) {
	sp := strings.Split(slug.Make(c.Name), "-")
	i := math.Min(float64(len(sp)), 5)

	c.Slug = fmt.Sprintf("%s-%s", strings.Join(sp[:int(i)], "-"), c.UUID.String()[:8])

	return nil
}

func CreateCollection(coll *Collection, user_uuid uuid.UUID) (Collection, error) {
	user, err := GetUser(user_uuid, user_uuid)
	if err != nil {
		return *coll, err
	}

	err = db.Model(&user).Association("Collections").Append(coll)
	if err != nil {
		return *coll, err
	}

	created, err := GetCollection(coll.UUID, user_uuid)
	return created, err
}

func GetCollection(uuid uuid.UUID, user_uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Preload("User").Where("uuid = ? AND (status = 'listed' OR user_uuid = ?)", uuid, user_uuid).First(&coll)
	if result.Error != nil {
		return coll, result.Error
	}

	var syllabi []Syllabus
	err := db.Model(&coll).Association("Syllabi").Find(&syllabi)
	if err != nil {
		return coll, err
	}

	for _, s := range syllabi {
		if s.Status == "listed" || s.UserUUID == user_uuid {
			coll.Syllabi = append(coll.Syllabi, &s)
		}
	}

	return coll, err
}

func GetCollectionBySlug(slug string, user_uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Preload("User").Where("slug = ?", slug).First(&coll)
	if result.Error != nil {
		return coll, result.Error
	}

	var syllabi []Syllabus
	err := db.Model(&coll).Association("Syllabi").Find(&syllabi)
	if err != nil {
		return coll, err
	}

	for _, s := range syllabi {
		if s.Status == "listed" || s.UserUUID == user_uuid {
			coll.Syllabi = append(coll.Syllabi, &s)
		}
	}

	return coll, err
}

func GetAllCollections(user_uuid uuid.UUID) ([]Collection, error) {
	coll := make([]Collection, 0)
	result := db.Preload("User").Preload("Syllabi").Where("status = 'listed' OR user_uuid = ?", user_uuid).Find(&coll)
	return coll, result.Error
}

func UpdateCollection(uuid uuid.UUID, user_uuid uuid.UUID, coll *Collection) (Collection, error) {
	var existing Collection
	result := db.Where("uuid = ?", uuid).First(&existing)
	if result.Error != nil {
		return *coll, result.Error
	}

	result = db.Model(&existing).Where("uuid = ?", uuid).Updates(&coll)
	return existing, result.Error
}

func AddSyllabusToCollection(coll_uuid uuid.UUID, syll_uuid uuid.UUID, user_uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Where("uuid = ? AND user_uuid = ?", coll_uuid, user_uuid).First(&coll)
	if result.Error != nil {
		return coll, result.Error
	}

	var syll Syllabus
	result = db.Preload("Collections").Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return coll, result.Error
	}

	for _, c := range syll.Collections {
		if c.UUID == coll_uuid {
			return coll, fmt.Errorf("the syllabus already belongs to the collection")
		}
	}

	err := db.Model(&coll).Association("Syllabi").Append(&syll)
	if err != nil {
		return coll, err
	}

	updated, err := GetCollection(coll_uuid, user_uuid)
	return updated, err
}

// -- removes the assocation between syllabus and collection
func RemoveCollectionSyllabus(coll_uuid uuid.UUID, syll_uuid uuid.UUID, user_uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Where("uuid = ? AND user_uuid = ?", coll_uuid, user_uuid).First(&coll)
	if result.Error != nil {
		return coll, result.Error
	}

	var syll Syllabus
	result = db.Where("uuid = ? ", syll_uuid).First(&syll)
	if result.Error != nil {
		return coll, result.Error
	}

	err := db.Model(&coll).Association("Syllabi").Delete(syll)
	return coll, err
}

func DeleteCollection(uuid uuid.UUID, user_uuid uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.Where("uuid = ?", uuid).First(&coll)
	if result.Error != nil {
		return coll, result.Error
	}

	result = db.Where("uuid = ?", uuid).Delete(&coll)
	return coll, result.Error
}
