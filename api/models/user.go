package models

import (
	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

const (
	UserPending   string = "pending"
	UserConfirmed string = "confirmed"
	UserDeleted   string = "deleted"
)

type User struct {
	gorm.Model
	UUID uuid.UUID `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`

	Email    string `gorm:"unique;not null" json:"email"`
	Password []byte `gorm:"not null" json:"password"`
	Status   string `gorm:"default:pending" json:"status"`

	Name      string `gorm:"not null" json:"name"`
	Bio       string `json:"bio"`
	Education string `json:"education"`

	// Position []struct {
	// 	Name     string
	// 	Institution Institution
	// }

	URLs pq.StringArray `gorm:"type:text[]" json:"urls"`

	//-- has many
	// Resources   []Resource   `gorm:"foreignKey:UserUUID;references:UUID" json:"resources"`
	Collections []Collection `gorm:"foreignKey:UserUUID;references:UUID" json:"collections"`
	Syllabi     []Syllabus   `gorm:"foreignKey:UserUUID;references:UUID" json:"syllabi"`
}

func CreateUser(user *User) (User, error) {
	result := db.Create(user)
	return *user, result.Error
}

func GetUser(uuid uuid.UUID) (User, error) {
	var user User
	result := db.Preload("Syllabi").Where("uuid = ?", uuid).First(&user)
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

func UpdateUser(uuid uuid.UUID, user *User) (User, error) {
	var existing User
	result := db.Where("uuid = ?", uuid).First(&existing)
	if result.Error != nil {
		return *user, result.Error
	}

	result = db.Model(&existing).Where("uuid = ?", uuid).Updates(user)

	return existing, result.Error
}

func DeleteUser(uuid uuid.UUID) (User, error) {
	var user User
	result := db.Where("uuid = ?", uuid).First(&user)
	if result.Error != nil {
		return user, result.Error
	}
	result = db.Where("uuid = ?", uuid).Delete(&user)

	return user, result.Error
}
