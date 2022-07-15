package models

import (
	"context"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/google/uuid"
)

type Token struct {
	Token  string    `bun:",pk"`
	UserID uuid.UUID `bun:",type:uuid"`
}

func CreateToken(_id uuid.UUID) (Token, error) {
	// generate hash
	hash := "eroifj"
	token := Token{hash, _id}
	ctx := context.Background()
	_, err := db.NewInsert().Model(&token).Exec(ctx)
	return token, err
}

func GetTokenUser(_token string) (User, error) {
	var user User
	var token Token

	ctx := context.Background()
	err := db.NewSelect().Model(&token).Where("token = ?", _token).Scan(ctx)
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

func DeleteToken(_token string) error {
	ctx := context.Background()
	var token Token
	err := db.NewSelect().Model(&token).Where("token = ?", _token).Scan(ctx)
	return err
}
