package models

import (
	"context"
	"time"
)

type Resource struct {
	ID        int64     `bun:"id,pk,autoincrement" json:"id"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	SyllabusAttachedID int64  `bun:"syllabus_attached_id,notnull" yaml:"syllabus_attached_id" json:"syllabus_attached_id"`
	Name               string `bun:"name,notnull" json:"name"`
}

func GetAllResources() ([]Resource, error) {
	ctx := context.Background()
	att := make([]Resource, 0)

	err := db.NewSelect().Model(&att).Scan(ctx, &att)
	return att, err
}

func AddNewResource(att *Resource) (Resource, error) {
	ctx := context.Background()

	_, err := db.NewInsert().Model(att).Exec(ctx)
	return *att, err
}

func UpdateResource(id int, att *Resource) (Resource, error) {
	ctx := context.Background()
	_, err := db.NewUpdate().Model(att).OmitZero().Where("id = ?", id).Exec(ctx)
	return *att, err
}

func GetResource(id int) (Resource, error) {
	ctx := context.Background()
	table := new(Resource)
	var att Resource
	err := db.NewSelect().Model(table).Where("id = ?", id).Scan(ctx, &att)
	return att, err
}

func DeleteResource(id int) error {
	ctx := context.Background()
	table := new(Resource)
	_, err := db.NewDelete().Model(table).Where("id = ?", id).Exec(ctx)

	return err
}
