package models

import (
	"context"
	"time"
)

type Resource struct {
	ID        int64     `bun:"id,pk,autoincrement" json:"id"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	SyllabusID int64     `bun:"syllabus_id,notnull" yaml:"syllabus_id" json:"syllabus_id"`
	Syllabus   *Syllabus `bun:"rel:belongs-to,join:syllabus_id=id" json:"syllabus"`

	Name string `bun:"name,notnull" json:"name"`
}

func CreateResource(res *Resource) (Resource, error) {
	ctx := context.Background()
	_, err := db.NewInsert().Model(res).Exec(ctx)
	return *res, err
}

func GetResource(id int) (Resource, error) {
	ctx := context.Background()
	var res Resource
	err := db.NewSelect().Model(&res).Where("id = ?", id).Relation("Syllabus").Scan(ctx)
	return res, err
}

func GetAllResources() ([]Resource, error) {
	ctx := context.Background()
	res := make([]Resource, 0)
	err := db.NewSelect().Model(&res).Relation("Syllabus").Scan(ctx)
	return res, err
}

func UpdateResource(id int, res *Resource) (Resource, error) {
	ctx := context.Background()
	_, err := db.NewUpdate().Model(res).OmitZero().Where("id = ?", id).Exec(ctx)
	return *res, err
}

func DeleteResource(id int) error {
	ctx := context.Background()
	var res Resource
	_, err := db.NewDelete().Model(&res).Where("id = ?", id).Exec(ctx)
	return err
}
