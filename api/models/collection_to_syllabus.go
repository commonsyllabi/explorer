package models

import (
	"time"

	"github.com/google/uuid"
)

type CollectionToSyllabus struct {
	CreatedAt    time.Time   `bun:",notnull,default:current_timestamp" json:"created_at"`
	CollectionID uuid.UUID   `bun:",pk,type:uuid"`
	Collection   *Collection `bun:"rel:has-one,join:collection_id=id"`
	SyllabusID   uuid.UUID   `bun:",pk,type:uuid"`
	Syllabus     *Syllabus   `bun:"rel:has-one,join:syllabus_id=id"`
}

func CreateCollectionSyllabus(coll Collection, syll Syllabus) (Collection, error) {
	cts := &CollectionToSyllabus{
		CollectionID: coll.ID,
		Collection:   &coll,
		SyllabusID:   syll.ID,
		Syllabus:     &syll,
	}

	result := db.Create(cts)

	return coll, result.Error
}

func DeleteCollectionSyllabus(coll_id uuid.UUID, syll_id uuid.UUID) (Collection, error) {
	var coll Collection
	var cts CollectionToSyllabus
	result := db.Where("syllabus_id = ? AND collection_id = ?", syll_id, coll_id).Delete(&cts, coll_id)
	if result.Error != nil {
		return coll, result.Error
	}

	coll, err := GetCollection(coll_id)
	return coll, err
}
