package models

import "time"

type Collection struct {
	ID        int64     `bun:"id,pk,autoincrement" json:"id"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"created_at"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"updated_at"`

	Syllabi       []*Syllabus `bun:"rel:has-many" json:"syllabi"`
	Name          string      `json:"name"`
	UserCreatedID int64       `yaml:"user_created_id" json:"user_created_id"`
}
