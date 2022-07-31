package models

import (
	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Token struct {
	gorm.Model
	UUID   uuid.UUID `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	UserID uuid.UUID `gorm:"type:uuid" yaml:"user_id" json:"user_id"`
}

func CreateToken(token_uuid uuid.UUID) (Token, error) {
	hash := uuid.New()
	token := Token{gorm.Model{}, hash, token_uuid}
	result := db.Create(&token)
	return token, result.Error
}

// GetTokenUser takes a token and returns the full user associated with it
func GetTokenUser(token_uuid uuid.UUID) (User, error) {
	var user User
	var token Token

	result := db.Where("uuid = ?", token_uuid).First(&token)
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

func DeleteToken(token_uuid uuid.UUID) error {
	var token Token
	result := db.Where("uuid = ?", token_uuid).First(&token)
	if result.Error != nil {
		return result.Error
	}

	result = db.Where("uuid = ?", token_uuid).Delete(&token)
	return result.Error
}
