package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Institution struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	UUID      uuid.UUID      `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`

	UserUUID uuid.UUID   `gorm:"type:uuid;default:uuid_generate_v4()" json:"user_uuid" yaml:"user_uuid"`
	User     User        `gorm:"foreignKey:UserUUID;references:UUID" json:"user"`
	Syllabi  []*Syllabus `gorm:"many2many:institutions_syllabi;" json:"syllabi"`

	Name     string `json:"name"`
	Country  string `json:"country"` //-- iso 3166
	Date     Date   `gorm:"embedded;embeddedPrefix:date_" json:"date"`
	URL      string `json:"url"`
	Position string `json:"position"`
}

type Date struct {
	Term string `json:"term"`
	Year int    `json:"year"`
}
