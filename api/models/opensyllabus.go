package models

import (
	"fmt"
)

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
	Institutions     []OpenSyllabusParsedInstitution `json:"institutions"`
	AcademicFields   []string                        `json:"academic_field"`
	AcademicLevel    string                          `json:"academic_level"`
	Language         string                          `json:"language"`
	Duration         string                          `json:"duration"`
	Tags             []string                        `json:"tags"`
	Description      string                          `json:"description"`
	LearningOutcomes []string                        `json:"learning_outcomes"`
	TopicOutline     string                          `json:"topic_outlines"`
	Readings         []string                        `json:"readings"`
	GradingRubric    []string                        `json:"grading_rubric"`
	Schedule         []string                        `json:"other"`
	Attachments      []string                        `json:"attachments"`
	Assessments      []string                        `json:"assignments"`
	URLs             []string                        `json:"urls"`
}

func (os *OpenSyllabus) GetInstitution() []OpenSyllabusParsedInstitution {
	// Initialize the institution
	var institutions []OpenSyllabusParsedInstitution

	institution := OpenSyllabusParsedInstitution{
		Name: os.Data.ExtractedSections.Institution.Name,
		// Country: os.Data.ExtractedSections.Institution.Country,
		URL: os.Data.ExtractedSections.Institution.URL,
	}

	// add the institution to the institutions array
	institutions = append(institutions, institution)

	return institutions
}

func (os *OpenSyllabus) GetAcademicField() []string {
	var academicFields []string

	// TODO: ignore academic fields for now: the conversion from CID to ISCED is a pain

	return academicFields
}

func (os *OpenSyllabus) GetTitle() string {
	var title string
	var maxProbability float64 = 0

	for _, t := range os.Data.ExtractedSections.Title {
		if t.MeanProbability > maxProbability {
			maxProbability = t.MeanProbability
			title = t.Text
		}
	}

	return title
}

func (os *OpenSyllabus) GetDescription() string {
	var desc string

	var maxProbability float64 = 0
	for _, d := range os.Data.ExtractedSections.Description {
		if d.MeanProbability > maxProbability {
			maxProbability = d.MeanProbability
			desc = d.Text
		}
	}

	return desc
}

func (os *OpenSyllabus) GetReadings() []string {
	var readings []string

	for _, c := range os.Data.Citations {
		var title, author string
		if len(c.Parsed.Title) > 0 {
			title = c.Parsed.Title[0].Text
		} else {
			title = "Unknown title"
		}

		if len(c.Parsed.Author) > 0 {
			author = c.Parsed.Author[0].Text
		} else {
			author = "Unknown author"
		}
		reading := fmt.Sprintf("%s, %s", title, author)
		readings = append(readings, reading)
	}

	return readings
}

func (os *OpenSyllabus) GetGradingRubric() []string {
	var rubric []string

	for _, lo := range os.Data.ExtractedSections.GradingRubric {
		if lo.MeanProbability > 0.5 {
			rubric = append(rubric, lo.Text)
		}
	}

	return rubric
}

func (os *OpenSyllabus) GetLearningOutcomes() []string {
	var outcomes []string

	for _, lo := range os.Data.ExtractedSections.LearningOutcomes {
		if lo.MeanProbability > 0.5 {
			outcomes = append(outcomes, lo.Text)
		}
	}

	return outcomes
}

func (os *OpenSyllabus) GetSchedule() []string {
	var schedule []string

	for _, sch := range os.Data.ExtractedSections.AssignmentSchedule {
		if sch.MeanProbability > 0.5 {
			schedule = append(schedule, sch.Text)
		}
	}

	return schedule
}

func (os *OpenSyllabus) GetAssignments() []string {
	var assignments []string

	for _, ass := range os.Data.ExtractedSections.AssessmentStrategy {
		if ass.MeanProbability > 0.5 {
			assignments = append(assignments, ass.Text)
		}
	}

	return assignments
}
