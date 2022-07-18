package models

import (
	"context"
	"time"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/google/uuid"
)

type Token struct {
	ID        uuid.UUID `bun:",pk,type:uuid,default:uuid_generate_v4()"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UserID    uuid.UUID `bun:"user_id,type:uuid" yaml:"user_id" json:"user_id"`
}

func CreateToken(_id uuid.UUID) (Token, error) {
	hash := uuid.New()
	token := Token{hash, time.Now(), _id}
	ctx := context.Background()
	_, err := db.NewInsert().Model(&token).Exec(ctx)
	return token, err
}

// GetTokenUser takes a token and returns the full user associated with it
func GetTokenUser(_id uuid.UUID) (User, error) {
	var user User
	var token Token

	ctx := context.Background()
	err := db.NewSelect().Model(&token).Where("id = ?", _id).Scan(ctx)
	if err != nil {
		zero.Error(err.Error())
		return user, err
	}

	user, err = GetUser(token.UserID)
	if err != nil {
		zero.Error(err.Error())
		return user, err
	}

	return user, err
}

func DeleteToken(_id uuid.UUID) error {
	ctx := context.Background()
	var token Token
	err := db.NewSelect().Model(&token).Where("id = ?", _id).Scan(ctx)
	if err != nil {
		return err
	}

	_, err = db.NewDelete().Model(&token).Where("id = ?", _id).Exec(ctx)
	return err
}
