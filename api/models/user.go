package models

import "time"

type User struct {
	ID        int64     `bun:"id,pk,autoincrement"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp"`
	UpdatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp"`

	Email       string
	Syllabi     []*Syllabus   `bun:"rel:has-many" form:"syllabi" json:"syllabi"`
	Collections []*Collection `bun:"rel:has-many"`
}
