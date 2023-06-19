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
			Description []struct {
				Text            string  `json:"text"`
				MeanProbability float64 `json:"mean_proba"`
			} `json:"description"`
			LearningOutcomes []struct {
				Text            string  `json:"text"`
				MeanProbability float64 `json:"mean_proba"`
			} `json:"learning_outcomes"`
			TopicOutline []struct {
				Text            string  `json:"text"`
				MeanProbability float64 `json:"mean_proba"`
			} `json:"topic_outline"`
			AssessmentStrategy []struct {
				Text            string  `json:"text"`
				MeanProbability float64 `json:"mean_proba"`
			} `json:"assessment_strategy"`
			RequiredReadings []struct {
				Text            string  `json:"text"`
				MeanProbability float64 `json:"mean_proba"`
			} `json:"required_readings"`
			GradingRubric []struct {
				Text            string  `json:"text"`
				MeanProbability float64 `json:"mean_proba"`
			} `json:"grading_rubric"`
			AssignmentSchedule []struct {
				Text            string  `json:"text"`
				MeanProbability float64 `json:"mean_proba"`
			} `json:"assignment_schedule"`
		} `json:"extracted_sections"`
		URLs      []string `json:"urls"`
		Citations []struct {
			Parsed struct {
				Title []struct {
					Text            string  `json:"text"`
					MeanProbability float64 `json:"mean_proba"`
				} `json:"title"`
				Author []struct {
					Text            string  `json:"text"`
					MeanProbability float64 `json:"mean_proba"`
				} `json:"author"`
			} `json:"parsed_citation"`
		} `json:"citations"`
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
	Title            string                          `json:"title"`
	Institutions     []OpenSyllabusParsedInstitution `json:"institution"`
	AcademicFields   []string                        `json:"academic_field"`
	AcademicLevel    string                          `json:"academic_level"`
	Language         string                          `json:"language"`
	Duration         string                          `json:"duration"`
	Tags             []string                        `json:"tags"`
	Description      string                          `json:"description"`
	LearningOutcomes []string                        `json:"learning_outcomes"`
	TopicOutline     string                          `json:"topic_outline"`
	Readings         []string                        `json:"readings"`
	GradingRubric    []string                        `json:"grading_rubric"`
	Schedule         []string                        `json:"schedule"`
	Attachments      []string                        `json:"attachments"`
	Assessments      []string                        `json:"assignments"`
	URLs             []string                        `json:"urls"`
}
