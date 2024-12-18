package models

import (
	"fmt"
	"math"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gosimple/slug"
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
	Education pq.StringArray `gorm:"type:text[]" json:"education" form:"education[]"`
	Email     string         `gorm:"unique;not null" json:"email" form:"email"`
	Name      string         `gorm:"default:Anonymous User;not null" json:"name" form:"name"`
	Slug      string         `gorm:"" json:"slug"`
	Password  []byte         `gorm:"not null" json:"password"`
	URLs      pq.StringArray `gorm:"type:text[]" json:"urls" form:"urls[]"`

	Institutions []Institution `gorm:"many2many:inst_users;" json:"institutions"`

	Collections []Collection `gorm:"foreignKey:UserUUID;references:UUID" json:"collections"`
	Syllabi     []Syllabus   `gorm:"foreignKey:UserUUID;references:UUID" json:"syllabi"`

	IsNewsletterSubscribed bool `gorm:"default:false" json:"is_newsletter_subscribed" form:"is_newsletter_subscribed"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	s := strings.Split(slug.Make(u.Name), "-")
	i := math.Min(float64(len(s)), 5)

	u.Slug = fmt.Sprintf("%s-%s", strings.Join(s[:int(i)], "-"), u.UUID.String()[:8])

	return nil
}

func CreateUser(user *User) (User, error) {
	result := db.Create(user)
	return *user, result.Error
}

func GetUser(uuid uuid.UUID, user_uuid uuid.UUID) (User, error) {
	var user User
	err := db.Where("uuid = ?", uuid).First(&user).Error
	if err != nil {
		return user, err
	}

	var colls []Collection
	err = db.Where("user_uuid = ?", uuid).Preload("Syllabi").Find(&colls).Error
	if err != nil {
		return user, err
	}

	for _, coll := range colls {
		if coll.Status == "listed" || coll.UserUUID == user_uuid {
			user.Collections = append(user.Collections, coll)
		}
	}

	var sylls []Syllabus
	err = db.Model(&user).Association("Syllabi").Find(&sylls)
	if err != nil {
		return user, err
	}

	for _, syll := range sylls {
		if syll.Status == "listed" || syll.UserUUID == user_uuid {
			user.Syllabi = append(user.Syllabi, syll)
		}
	}

	var insts []Institution
	err = db.Model(&user).Association("Institutions").Find(&insts)
	if err != nil {
		return user, err
	}

	user.Institutions = append(user.Institutions, insts...)

	return user, err
}

func GetUserByEmail(email string, user_uuid uuid.UUID) (User, error) {
	var user User
	err := db.Preload("Collections").Where("email = ?", email).Find(&user).Error
	if err != nil {
		return user, err
	}

	var sylls []Syllabus
	err = db.Model(&user).Association("Syllabi").Find(&sylls)
	if err != nil {
		return user, err
	}

	for _, syll := range sylls {
		if syll.Status == "listed" || syll.UserUUID == user_uuid {
			user.Syllabi = append(user.Syllabi, syll)
		}
	}

	var insts []Institution
	err = db.Model(&user).Association("Institutions").Find(&insts)
	if err != nil {
		return user, err
	}

	user.Institutions = append(user.Institutions, insts...)

	return user, err
}

func GetUserBySlug(slug string, user_uuid uuid.UUID) (User, error) {
	var user User
	err := db.Preload("Collections").Where("slug = ?", slug).Find(&user).Error
	if err != nil {
		return user, err
	}

	if user.UUID == uuid.Nil {
		return user, fmt.Errorf("could not find the user with slug: %v", slug)
	}

	var sylls []Syllabus
	err = db.Model(&user).Association("Syllabi").Find(&sylls)
	if err != nil {
		return user, err
	}

	for _, syll := range sylls {
		if syll.Status == "listed" || syll.UserUUID == user_uuid {
			user.Syllabi = append(user.Syllabi, syll)
		}
	}

	var insts []Institution
	err = db.Model(&user).Association("Institutions").Find(&insts)
	if err != nil {
		return user, err
	}

	user.Institutions = append(user.Institutions, insts...)

	return user, err
}

func GetAllUsers() ([]User, error) {
	users := make([]User, 0)
	result := db.Find(&users)
	return users, result.Error
}

func UpdateUser(uuid uuid.UUID, user_uuid uuid.UUID, user *User) (User, error) {
	var existing User
	result := db.Where("uuid = ? AND uuid = ?", uuid, user_uuid).First(&existing)
	if result.Error != nil {
		return *user, result.Error
	}

	result = db.Model(&existing).Where("uuid = ?", uuid).Updates(user)

	return existing, result.Error
}

func AddInstitutionToUser(uuid uuid.UUID, user_uuid uuid.UUID, inst *Institution) (User, error) {
	var user User
	result := db.Where("uuid = ? AND uuid = ?", uuid, user_uuid).Preload("Institutions").First(&user)
	if result.Error != nil {
		return user, result.Error
	}

	err := db.Model(&user).Association("Institutions").Append(inst)
	if err != nil {
		return user, err
	}

	updated, err := GetUser(user_uuid, user_uuid)
	return updated, err
}

func EditInstitutionToUser(uuid uuid.UUID, inst_uuid uuid.UUID, inst *Institution) (User, error) {
	var existing Institution
	result := db.Where("uuid = ?", inst_uuid).First(&existing)
	if result.Error != nil {
		return User{}, result.Error
	}

	err := db.Model(&existing).Updates(inst).Error
	if err != nil {
		return User{}, err
	}

	updated, err := GetUser(uuid, uuid)
	return updated, err
}

func RemoveInstitutionFromUser(uuid uuid.UUID, inst_uuid uuid.UUID, user_uuid uuid.UUID) (User, error) {
	var user User
	result := db.Where("uuid = ? AND uuid = ?", uuid, user_uuid).First(&user)
	if result.Error != nil {
		return user, result.Error
	}

	var inst Institution
	result = db.Where("uuid = ? ", inst_uuid).First(&inst)
	if result.Error != nil {
		return user, result.Error
	}

	err := db.Model(&user).Association("Institutions").Delete(inst)
	if err != nil {
		return user, err
	}

	updated, err := GetUser(user_uuid, user_uuid)
	return updated, err
}

func DeleteUser(uuid uuid.UUID, user_uuid uuid.UUID) (User, error) {
	var user User
	result := db.Where("uuid = ? AND uuid = ?", uuid, user_uuid).First(&user)
	if result.Error != nil {
		return user, result.Error
	}
	result = db.Select(clause.Associations).Where("uuid = ?", uuid).Delete(&user)

	return user, result.Error
}
