package models

import (
	"time"

	"github.com/google/uuid"
)

type Syllabus struct {
	ID        uuid.UUID `bun:",pk,type:uuid,default:uuid_generate_v4()"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	UserID uuid.UUID `bun:"user_id" yaml:"user_id" json:"user_id"`
	User   *User     `bun:"rel:belongs-to,join:user_id=id" json:"user"`

	CollectionID uuid.UUID   `bun:"collection_id" yaml:"collection_id" json:"collection_id"`
	Resources    []*Resource `bun:"rel:has-many,join:id=syllabus_id" json:"resources"`
	Title        string      `bun:",notnull" json:"title" form:"title"`
	//-- todo: how to have many to many relation for collections?
}

func CreateSyllabus(syll *Syllabus) (Syllabus, error) {
	result := db.Create(syll)
	return *syll, result.Error
}

func GetSyllabus(id uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.First(&syll, id)
	return syll, result.Error
}

func GetAllSyllabi() ([]Syllabus, error) {
	var syllabi []Syllabus
	result := db.Find(&syllabi)
	return syllabi, result.Error
}

func UpdateSyllabus(id uuid.UUID, syll *Syllabus) (Syllabus, error) {
	existing := new(Syllabus)
	result := db.First(&existing, id)
	if result.Error != nil {
		return *syll, result.Error
	}

	syll.UpdatedAt = time.Now()
	result = db.Model(Syllabus{}).Where("id = ?", id).Updates(syll)
	return *syll, result.Error
}

func DeleteSyllabus(id uuid.UUID) (Syllabus, error) {
	var syll Syllabus
	result := db.First(&syll, id)
	if result.Error != nil {
		return syll, result.Error
	}
	result = db.Delete(&syll, id)
	return syll, result.Error
}
