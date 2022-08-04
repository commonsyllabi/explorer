package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const (
	UserPending   string = "pending"
	UserConfirmed string = "confirmed"
	UserDeleted   string = "deleted"
)

type User struct {
	ID        uint           `gorm:"primaryKey"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deleted_at"`
	UUID      uuid.UUID      `gorm:"uniqueIndex;type:uuid;primaryKey;default:uuid_generate_v4()" json:"uuid" yaml:"uuid"`
	Status    string         `gorm:"default:pending" json:"status"`

	Bio       string         `json:"bio" form:"bio"`
	Education string         `json:"education" form:"education"`
	Email     string         `gorm:"unique;not null" json:"email" form:"email"`
	Name      string         `gorm:"default:Anonymous User;not null" json:"name" form:"name"`
	Password  []byte         `gorm:"not null" json:"password"`
	URLs      pq.StringArray `gorm:"type:text[]" json:"urls" form:"urls[]"`

	Institutions []Institution `gorm:"foreignKey:UserUUID;references:UUID" json:"institutions"`

	Collections []Collection `gorm:"foreignKey:UserUUID;references:UUID" json:"collections"`
	Syllabi     []Syllabus   `gorm:"foreignKey:UserUUID;references:UUID" json:"syllabi"`
}

func CreateUser(user *User) (User, error) {
	result := db.Create(user)
	return *user, result.Error
}

func GetUser(uuid uuid.UUID) (User, error) {
	var user User
	result := db.Preload("Syllabi").Preload("Collections").Preload("Institutions").Where("uuid = ?", uuid).First(&user)
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
	result = db.Select(clause.Associations).Where("uuid = ?", uuid).Delete(&user)

	return user, result.Error
}
