package models

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type Resource struct {
	ID        uuid.UUID `bun:",pk,type:uuid,default:uuid_generate_v4()"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	SyllabusID uuid.UUID `bun:"syllabus_id,notnull" yaml:"syllabus_id" json:"syllabus_id"`
	Syllabus   *Syllabus `bun:"rel:belongs-to,join:syllabus_id=id" json:"syllabus"`

	Name string `bun:"name,notnull" json:"name" form:"name" binding:"required"`
}

func CreateResource(res *Resource) (Resource, error) {
	ctx := context.Background()
	_, err := db.NewInsert().Model(res).Exec(ctx)
	return *res, err
}

func GetResource(id uuid.UUID) (Resource, error) {
	ctx := context.Background()
	var res Resource
	err := db.NewSelect().Model(&res).Where("resource.id = ?", id).Relation("Syllabus").Scan(ctx)
	return res, err
}

func GetAllResources() ([]Resource, error) {
	ctx := context.Background()
	res := make([]Resource, 0)
	err := db.NewSelect().Model(&res).Relation("Syllabus").Scan(ctx)
	return res, err
}

func UpdateResource(id uuid.UUID, res *Resource) (Resource, error) {
	ctx := context.Background()
	err := db.NewSelect().Model(res).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return *res, err
	}
	_, err = db.NewUpdate().Model(res).OmitZero().Where("id = ?", id).Exec(ctx)
	return *res, err
}

func DeleteResource(id uuid.UUID) (Resource, error) {
	ctx := context.Background()
	var res Resource
	err := db.NewSelect().Model(&res).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return res, err
	}

	_, err = db.NewDelete().Model(&res).Where("id = ?", id).Exec(ctx)
	return res, err
}
