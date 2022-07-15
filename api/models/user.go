package models

import (
	"context"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `bun:",pk,type:uuid,default:uuid_generate_v4()"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	Email       string        `json:"email" form:"email" binding:"required,email"`
	Password    []byte        `json:"password"` // no form binding to prevent storing cleartext
	Syllabi     []*Syllabus   `bun:"syllabi,rel:has-many" form:"syllabi" json:"syllabi"`
	Collections []*Collection `bun:"rel:has-many" json:"collections"`
}

func CreateUser(user *User) (User, error) {
	ctx := context.Background()
	_, err := db.NewInsert().Model(user).Exec(ctx)
	return *user, err
}

func GetUser(id uuid.UUID) (User, error) {
	ctx := context.Background()
	var user User
	err := db.NewSelect().Model(&user).Where("id = ?", id).Relation("Syllabi").Relation("Collections").Scan(ctx)
	return user, err
}

func GetUserByEmail(email string) (User, error) {
	ctx := context.Background()
	var user User
	err := db.NewSelect().Model(&user).Where("email = ?", email).Scan(ctx)
	return user, err
}

func GetAllUsers() ([]User, error) {
	ctx := context.Background()
	users := make([]User, 0)
	err := db.NewSelect().Model(&users).Relation("Syllabi").Relation("Collections").Scan(ctx)
	return users, err
}

func UpdateUser(id uuid.UUID, user *User) (User, error) {
	ctx := context.Background()
	err := db.NewSelect().Model(user).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return *user, err
	}

	_, err = db.NewUpdate().Model(user).OmitZero().WherePK().Exec(ctx)
	return *user, err
}

func DeleteUser(id uuid.UUID) error {
	ctx := context.Background()
	var user User
	err := db.NewSelect().Model(&user).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return err
	}
	_, err = db.NewDelete().Model(&user).Where("id = ?", id).Exec(ctx) //-- what to do with dangling collections and syllabi?

	return err
}
