package models

import (
	"context"
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
	ctx := context.Background()
	_, err := db.NewInsert().Model(coll).Exec(ctx)
	return *coll, err
}

func GetCollection(id uuid.UUID) (Collection, error) {
	ctx := context.Background()
	var coll Collection
	err := db.NewSelect().Model(&coll).Where("collection.id = ?", id).Relation("Syllabi").Relation("User").Scan(ctx)
	return coll, err
}

func GetAllCollections() ([]Collection, error) {
	ctx := context.Background()
	coll := make([]Collection, 0)
	err := db.NewSelect().Model(&coll).Relation("User").Scan(ctx, &coll)
	return coll, err
}

func UpdateCollection(id uuid.UUID, coll *Collection) (Collection, error) {
	ctx := context.Background()
	err := db.NewSelect().Model(coll).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return *coll, err
	}
	_, err = db.NewUpdate().Model(coll).OmitZero().Where("id = ?", id).Exec(ctx)
	return *coll, err
}

func DeleteCollection(id uuid.UUID) error {
	ctx := context.Background()
	var coll Collection
	err := db.NewSelect().Model(&coll).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return err
	}

	_, err = db.NewDelete().Model(&coll).Where("id = ?", id).Exec(ctx)
	return err
}
