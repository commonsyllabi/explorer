package models

import (
	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Token struct {
	gorm.Model
	TokenID uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID  uuid.UUID `bun:"user_id,type:uuid" yaml:"user_id" json:"user_id"`
}

func CreateToken(_id uuid.UUID) (Token, error) {
	hash := uuid.New()
	token := Token{gorm.Model{}, hash, _id}
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
