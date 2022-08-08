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

	// Users   []*User     `gorm:"many2many:institutions_users;" json:"users"`
	// Syllabi []*Syllabus `gorm:"many2many:institutions_syllabi;" json:"syllabi"`

	Name     string `json:"name" form:"name"`
	Country  string `json:"country" form:"country"` //-- iso 3166
	Date     Date   `gorm:"embedded;embeddedPrefix:date_" json:"date" form:"date"`
	URL      string `json:"url" form:"url"`
	Position string `json:"position" form:"position"`
}

type Date struct {
	Term string `json:"term" form:"date_term"`
	Year int    `json:"year" form:"date_year"`
}
