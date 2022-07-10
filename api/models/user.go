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

func CreateUser(syll *User) (User, error) {
	ctx := context.Background()
	_, err := db.NewInsert().Model(syll).Exec(ctx)
	return *syll, err
}

func GetAllUsers() ([]User, error) {
	ctx := context.Background()
	users := make([]User, 0)
	err := db.NewSelect().Model(&users).Relation("Syllabi").Relation("Collections").Scan(ctx)
	return users, err
}

func GetUser(id int) (User, error) {
	ctx := context.Background()
	var user User
	err := db.NewSelect().Model(&user).Where("id = ?", id).Relation("Syllabi").Relation("Collections").Scan(ctx)
	return user, err
}

func UpdateUser(id int, user *User) (User, error) {
	ctx := context.Background()
	_, err := db.NewUpdate().Model(user).OmitZero().Where("id = ?", id).Exec(ctx)
	return *user, err
}

func DeleteUser(id int) error {
	ctx := context.Background()
	var user User
	_, err := db.NewDelete().Model(&user).Where("id = ?", id).Exec(ctx) //-- what to do with dangling collections and syllabi?

	return err
}
