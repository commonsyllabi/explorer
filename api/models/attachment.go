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

type Attachment struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	UUID      uuid.UUID      `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	//-- belongs to a syllabus
	SyllabusUUID uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"syllabus_uuid" yaml:"syllabus_uuid"`
	Syllabus     Syllabus  `gorm:"foreignKey:SyllabusUUID;references:UUID" json:"syllabus"`

	Name        string `gorm:"not null" json:"name" form:"name"`
	Slug        string `gorm:"" json:"slug"`
	Type        string `gorm:"not null" json:"type" form:"type"`
	Description string `json:"description" form:"description"`
	URL         string `gorm:"not null" json:"url" form:"url"`
}

func (a *Attachment) BeforeCreate(tx *gorm.DB) (err error) {
	sp := strings.Split(slug.Make(a.Name), "-")
	i := math.Min(float64(len(sp)), 5)

	a.Slug = fmt.Sprintf("%s-%s", strings.Join(sp[:int(i)], "-"), a.UUID.String()[:8])

	return nil
}

func CreateAttachment(syllabus_uuid uuid.UUID, att *Attachment, user_uuid uuid.UUID) (Attachment, error) {
	syll, err := GetSyllabus(syllabus_uuid, user_uuid)
	if err != nil {
		return *att, err
	}

	att.Syllabus = syll
	err = db.Model(&syll).Association("Attachments").Append(att)
	if err != nil {
		return *att, err
	}

	created, err := GetAttachment(att.UUID)
	return created, err
}

func GetAttachment(uuid uuid.UUID) (Attachment, error) {
	var att Attachment
	result := db.Preload("Syllabus").Where("uuid = ?", uuid).First(&att)
	return att, result.Error
}

func GetAttachmentBySlug(slug string) (Attachment, error) {
	var att Attachment
	result := db.Preload("Syllabus").Where("slug = ?", slug).First(&att)
	return att, result.Error
}

func GetAllAttachments() ([]Attachment, error) {
	res := make([]Attachment, 0)
	result := db.Find(&res)
	return res, result.Error
}

func UpdateAttachment(uuid uuid.UUID, user_uuid uuid.UUID, att *Attachment) (Attachment, error) {
	var existing Attachment
	result := db.Where("uuid = ?", uuid).First(&existing)
	if result.Error != nil {
		return *att, result.Error
	}

	result = db.Model(&existing).Where("uuid = ?", uuid).Updates(att)
	return existing, result.Error
}

func DeleteAttachment(uuid uuid.UUID, user_uuid uuid.UUID) (Attachment, error) {
	var att Attachment
	result := db.Where("uuid = ?", uuid).First(&att)
	if result.Error != nil {
		return att, result.Error
	}

	result = db.Where("uuid = ? ", uuid).Delete(&att)
	return att, result.Error
}
