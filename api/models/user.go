package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

const (
	UserPending   string = "pending"
	UserConfirmed string = "confirmed"
	UserDeleted   string = "deleted"
)

type User struct {
	gorm.Model
	UserID uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`

	Email    string
	Password []byte
	Status   string
}

func CreateUser(user *User) (User, error) {
	result := db.Create(user)
	return *user, result.Error
}

func GetUser(id uuid.UUID) (User, error) {
	var user User
	result := db.First(&user, id)
	return user, result.Error
}

func GetUserByEmail(email string) (User, error) {
	var user User
	result := db.Where("email = ?", email).First(&user)
	return user, result.Error
}

func GetAllUsers() ([]User, error) {
	users := make([]User, 0)
	result := db.Find(&users)
	return users, result.Error
}

func UpdateUser(id uuid.UUID, user *User) (User, error) {
	existing := new(User)
	result := db.First(*existing, id)
	if result.Error != nil {
		return *user, result.Error
	}

	user.UpdatedAt = time.Now()
	result = db.Model(User{}).Where("id = ?", id).Updates(user)

	return *user, result.Error
}

func DeleteUser(id uuid.UUID) (User, error) {
	var user User
	result := db.First(&user, id)
	if result.Error != nil {
		return user, result.Error
	}
	result = db.Delete(&user, id)

	return user, result.Error
}
