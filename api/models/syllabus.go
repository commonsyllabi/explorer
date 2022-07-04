package models

import (
	"context"
	"time"
)

type Syllabus struct {
	ID        int64     `bun:"id,pk,autoincrement" json:"id"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	UserID               int64       `bun:"user_id" yaml:"user_id" json:"user_id"`
	User                 *User       `bun:"rel:belongs-to,join:user_id=id" json:"user"`
	SyllabusCollectionID int64       `bun:"syllabus_collection_id" yaml:"syllabus_collection_id" json:"syllabus_collection_id"`
	Resources            []*Resource `bun:"rel:has-many,join:id=syllabus_attached_id" json:"resources"`
	Title                string      `bun:",notnull" json:"title"`
	//-- todo: how to have many to many relation for collections?
}

func GetAllSyllabi() ([]Syllabus, error) {
	ctx := context.Background()
	syllabi := make([]Syllabus, 0)

	err := db.NewSelect().Model(&syllabi).Scan(ctx, &syllabi)
	return syllabi, err
}

func AddNewSyllabus(syll *Syllabus) (Syllabus, error) {
	ctx := context.Background()

	_, err := db.NewInsert().Model(syll).Exec(ctx)
	return *syll, err
}

func UpdateSyllabus(id int, syll *Syllabus) (Syllabus, error) {
	ctx := context.Background()
	_, err := db.NewUpdate().Model(syll).OmitZero().Where("id = ?", id).Exec(ctx)
	return *syll, err
}

func GetSyllabus(id int) (Syllabus, error) {
	ctx := context.Background()
	var syll Syllabus
	err := db.NewSelect().Model(&syll).Where("syllabus.id = ?", id).Relation("Resources").Relation("User").Scan(ctx)
	return syll, err
}

func DeleteSyllabus(id int) error {
	ctx := context.Background()
	table := new(Syllabus)
	_, err := db.NewDelete().Model(table).Where("id = ?", id).Exec(ctx) //-- what to do with dangling attachments?

	return err
}
