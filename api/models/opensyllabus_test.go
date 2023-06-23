package models

import "testing"

func TestOpenSyllabus_GetTitle(t *testing.T) {
	var raw OpenSyllabus
	var text struct {
		Text            string  `json:"text"`
		MeanProbability float64 `json:"mean_proba"`
	}
	text.Text = "test title"
	text.MeanProbability = 0.6

	raw.Data.ExtractedSections.Title = append(raw.Data.ExtractedSections.Title, text)
	expected := "test title"

	t.Run("test get file", func(t *testing.T) {
		if got := raw.GetTitle(); got != expected {
			t.Errorf("OpenSyllabus.GetTitle() = %v, want %v", got, expected)
		}
	})
}
