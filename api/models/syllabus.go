package models

import (
	"context"
	"time"
)

type Syllabus struct {
	ID        int64     `bun:",pk,autoincrement" json:"id"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	UserID int64 `bun:"user_id" yaml:"user_id" json:"user_id"`
	User   *User `bun:"rel:belongs-to,join:user_id=id" json:"user"`

	CollectionID int64       `bun:"collection_id" yaml:"collection_id" json:"collection_id"`
	Resources    []*Resource `bun:"rel:has-many,join:id=syllabus_id" json:"resources"`
	Title        string      `bun:",notnull" json:"title"`
	//-- todo: how to have many to many relation for collections?
}

func CreateSyllabus(syll *Syllabus) (Syllabus, error) {
	ctx := context.Background()
	_, err := db.NewInsert().Model(syll).Exec(ctx)
	return *syll, err
}

func GetSyllabus(id int64) (Syllabus, error) {
	ctx := context.Background()
	var syll Syllabus
	err := db.NewSelect().Model(&syll).Where("syllabus.id = ?", id).Relation("Resources").Relation("User").Scan(ctx)
	return syll, err
}

func GetAllSyllabi() ([]Syllabus, error) {
	ctx := context.Background()
	syllabi := make([]Syllabus, 0)
	err := db.NewSelect().Model(&syllabi).Relation("Resources").Relation("User").Scan(ctx)
	return syllabi, err
}

func UpdateSyllabus(id int64, syll *Syllabus) (Syllabus, error) {
	ctx := context.Background()
	err := db.NewSelect().Model(syll).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return *syll, err
	}

	_, err = db.NewUpdate().Model(syll).OmitZero().Where("id = ?", id).Exec(ctx)
	return *syll, err
}

func DeleteSyllabus(id int64) error {
	ctx := context.Background()
	var syll Syllabus
	err := db.NewSelect().Model(&syll).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return err
	}
	_, err = db.NewDelete().Model(&syll).Where("id = ?", id).Exec(ctx) //-- what to do with dangling resources?
	return err
}
