package models

import (
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
	result := db.Create(&token)
	return token, result.Error
}

// GetTokenUser takes a token and returns the full user associated with it
func GetTokenUser(_id uuid.UUID) (User, error) {
	var user User
	var token Token

	result := db.First(&token, _id)
	if result.Error != nil {
		zero.Error(result.Error.Error())
		return user, result.Error
	}

	user, err := GetUser(token.UserID)
	if err != nil {
		zero.Error(err.Error())
		return user, err
	}

	return user, err
}

func DeleteToken(_id uuid.UUID) error {
	var token Token
	result := db.First(&token, _id)
	if result.Error != nil {
		return result.Error
	}

	result = db.Delete(&token, _id)
	return result.Error
}
