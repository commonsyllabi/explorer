package models

import "time"

type Collection struct {
	CreatedAt     time.Time   `bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt     time.Time   `bun:",nullzero,notnull,default:current_timestamp"`
	ID            int64       `bun:"id,pk,autoincrement"`
	Syllabi       []*Syllabus `bun:"rel:has-many"`
	Name          string
	UserCreatedID int64 `yaml:"user_created_id"`
}
