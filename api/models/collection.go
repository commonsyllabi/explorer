package models

import (
	"time"

	"github.com/google/uuid"
)

type Collection struct {
	ID        uuid.UUID `bun:",pk,type:uuid,default:uuid_generate_v4()"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	Syllabi []*Syllabus `bun:"rel:has-many,join:id=collection_id" json:"syllabi"` //-- todo many to many
	Name    string      `json:"name" form:"name" binding:"required"`

	UserID uuid.UUID `bun:"user_id" yaml:"user_id" json:"user_id"`
	User   *User     `bun:"rel:belongs-to,join:user_id=id" json:"user"`
}

func CreateCollection(coll *Collection) (Collection, error) {
	result := db.Create(coll)
	return *coll, result.Error
}

func GetCollection(id uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.First(&coll, id)
	return coll, result.Error
}

func GetAllCollections() ([]Collection, error) {
	coll := make([]Collection, 0)
	result := db.Find(&coll)
	return coll, result.Error
}

func UpdateCollection(id uuid.UUID, coll *Collection) (Collection, error) {
	existing := new(Collection)
	result := db.First(existing, id)
	if result.Error != nil {
		return *coll, result.Error
	}

	coll.UpdatedAt = time.Now()
	result = db.Model(Collection{}).Where("id = ?", id).Updates(coll)
	return *coll, result.Error
}

func DeleteCollection(id uuid.UUID) (Collection, error) {
	var coll Collection
	result := db.First(&coll, id)
	if result.Error != nil {
		return coll, result.Error
	}

	result = db.Delete(&coll, id)
	return coll, result.Error
}
