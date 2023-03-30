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
				MeanProbability float64 `json:"mean_probability"`
			} `json:"title"`
		} `json:"extracted_sections"`
	} `json:"data"`
}
