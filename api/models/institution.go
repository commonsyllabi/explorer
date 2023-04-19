package models

import (
	"time"

	"github.com/biter777/countries"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Institution struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	UUID      uuid.UUID      `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	Name      string         `json:"name" form:"name"`
	Country   int            `json:"country" form:"country"`
	Date      Date           `gorm:"embedded;embeddedPrefix:date_" json:"date"`
	URL       string         `json:"url" form:"url"`
	Position  string         `json:"position" form:"position"`
}

type Date struct {
	Term string `json:"term" form:"date_term"`
	Year int    `json:"year" form:"date_year"`
}

func (i *Institution) BeforeCreate(tx *gorm.DB) (err error) {
	if countries.ByNumeric(i.Country) == countries.Unknown {
		// return fmt.Errorf("country is unknown, skipping create")
	}
	return nil
}

func (i *Institution) BeforeUpdate(tx *gorm.DB) (err error) {
	if countries.ByNumeric(i.Country) == countries.Unknown {
		// return fmt.Errorf("country is unknown, skipping update")
	}
	return nil
}
