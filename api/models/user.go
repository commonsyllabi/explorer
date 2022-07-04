package models

import (
	"context"
	"time"
)

type User struct {
	ID        int64     `bun:",pk,autoincrement" json:"id"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	Email       string        `json:"email"`
	Syllabi     []*Syllabus   `bun:"syllabi,rel:has-many" form:"syllabi" json:"syllabi"`
	Collections []*Collection `bun:"rel:has-many" json:"collections"`
}

func GetAllUsers() ([]User, error) {
	ctx := context.Background()
	syllabi := make([]User, 0)

	err := db.NewSelect().Model(&syllabi).Scan(ctx, &syllabi)
	return syllabi, err
}

func AddNewUser(syll *User) (User, error) {
	ctx := context.Background()

	_, err := db.NewInsert().Model(syll).Exec(ctx)
	return *syll, err
}

func UpdateUser(id int, syll *User) (User, error) {
	ctx := context.Background()
	_, err := db.NewUpdate().Model(syll).OmitZero().Where("id = ?", id).Exec(ctx)
	return *syll, err
}

func GetUser(id int) (User, error) {
	ctx := context.Background()
	var syll User
	err := db.NewSelect().Model(&syll).Where("id = ?", id).Relation("Syllabi").Relation("Collections").Scan(ctx)
	return syll, err
}

func DeleteUser(id int) error {
	ctx := context.Background()
	table := new(User)
	_, err := db.NewDelete().Model(table).Where("id = ?", id).Exec(ctx) //-- what to do with dangling attachments?

	return err
}
