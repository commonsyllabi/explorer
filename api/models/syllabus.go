package models

import (
	"context"
	"time"
)

type Syllabus struct {
	CreatedAt            time.Time   `bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt            time.Time   `bun:",nullzero,notnull,default:current_timestamp"`
	ID                   int64       `bun:"id,pk,autoincrement"`
	UserID               int64       `yaml:"user_id"`
	User                 *User       `bun:"rel:belongs-to"`
	SyllabusCollectionID int64       `bun:"syllabus_collection_id" yaml:"syllabus_collection_id"`
	Resources            []*Resource `bun:"rel:has-many,join:id=syllabus_attached_id"`
	Title                string      `bun:",notnull"`
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
	err := db.NewSelect().Model(&syll).Relation("Resources").Where("id = ?", id).Scan(ctx)
	return syll, err
}

func DeleteSyllabus(id int) error {
	ctx := context.Background()
	table := new(Syllabus)
	_, err := db.NewDelete().Model(table).Where("id = ?", id).Exec(ctx) //-- what to do with dangling attachments?

	return err
}
