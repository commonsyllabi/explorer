package models

type OpenSyllabus struct {
	Data struct {
		Field struct {
			Name string `json:"name"`
		} `json:"field"`
		Language          string `json:"language"`
		ExtractedSections struct {
			Title []struct {
				Text            string  `json:"text"`
				MeanProbability float64 `json:"mean_proba"`
			} `json:"title"`
			Institution struct {
				Name    string `json:"name"`
				City    string `json:"city"`
				Country string `json:"country"`
				URL     string `json:"url"`
			} `json:"institution"`
			Description        []struct{} `json:"description"`
			LearningOutcomes   []struct{} `json:"learning_outcomes"`
			TopicOutline       []struct{} `json:"topic_outline"`
			RequiredsReadings  []struct{} `json:"required_readings"`
			GradingRubric      []struct{} `json:"grading_rubric"`
			AssignmentSchedule []struct{} `json:"assignment_schedule"`
		} `json:"extracted_sections"`
	} `json:"data"`
}

type OpenSyllabusParsedInstitution struct {
	Name    string `json:"name"`
	Country string `json:"country"`
	URL     string `json:"url"`
	Date    Date   `json:"date"`
	Year    string `json:"year"`
	Term    string `json:"term"`
}

type OpenSyllabusParsed struct {
	Title              string                          `json:"title"`
	Institutions       []OpenSyllabusParsedInstitution `json:"institution"`
	AcademicFields     []string                        `json:"academic_field"`
	AcademicLevel      string                          `json:"academic_level"`
	Language           string                          `json:"language"`
	Duration           string                          `json:"duration"`
	Tags               []string                        `json:"tags"`
	Description        string                          `json:"description"`
	LearningOutcomes   string                          `json:"learning_outcomes"`
	TopicOutline       string                          `json:"topic_outline"`
	RequiredsReadings  string                          `json:"required_readings"`
	GradingRubric      string                          `json:"grading_rubric"`
	AssignmentSchedule string                          `json:"assignment_schedule"`
	Attachments        []string                        `json:"attachments"`
}
