package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"

	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func getInstitution(os models.OpenSyllabus) []models.OpenSyllabusParsedInstitution {
	// Initialize the institution
	var institutions []models.OpenSyllabusParsedInstitution

	institution := models.OpenSyllabusParsedInstitution{
		Name: os.Data.ExtractedSections.Institution.Name,
		// Country: os.Data.ExtractedSections.Institution.Country,
		URL: os.Data.ExtractedSections.Institution.URL,
	}

	// add the institution to the institutions array
	institutions = append(institutions, institution)

	return institutions
}

func getAcademicField(os models.OpenSyllabus) []string {
	var academicFields []string

	// TODO: ignore academic fields for now: the conversion from CID to ISCED is a pain

	return academicFields
}

func getTitle(os models.OpenSyllabus) string {
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

func getDescription(os models.OpenSyllabus) string {
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

func getReadings(os models.OpenSyllabus) []string {
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

func getGradingRubric(os models.OpenSyllabus) []string {
	var rubric []string

	for _, lo := range os.Data.ExtractedSections.GradingRubric {
		if lo.MeanProbability > 0.5 {
			rubric = append(rubric, lo.Text)
		}
	}

	return rubric
}

func getLearningOutcomes(os models.OpenSyllabus) []string {
	var outcomes []string

	for _, lo := range os.Data.ExtractedSections.LearningOutcomes {
		if lo.MeanProbability > 0.5 {
			outcomes = append(outcomes, lo.Text)
		}
	}

	return outcomes
}

func getSchedule(os models.OpenSyllabus) []string {
	var schedule []string

	for _, sch := range os.Data.ExtractedSections.AssignmentSchedule {
		if sch.MeanProbability > 0.5 {
			schedule = append(schedule, sch.Text)
		}
	}

	return schedule
}

func getAssignments(os models.OpenSyllabus) []string {
	var assignments []string

	for _, ass := range os.Data.ExtractedSections.AssessmentStrategy {
		if ass.MeanProbability > 0.5 {
			assignments = append(assignments, ass.Text)
		}
	}

	return assignments
}

func getProbability(jsonResponse interface{}) (float64, error) {
	data, ok := jsonResponse.(map[string]interface{})["data"].(map[string]interface{})
	if !ok {
		return 0, errors.New("invalid JSON format")
	}
	probability, ok := data["syllabus_probability"].(float64)
	if !ok {
		return 0, errors.New("syllabus_probability field is missing or not a number")
	}
	return probability, nil
}

// Function that fetches the URL (env var: OPENSYLLABUS_PARSER_API_URL) with the token (env: OPENSYLLABUS_PARSER_API_TOKEN) and appends the file to its body.
// and returns then returns the parsed syllabus as a json object and handles errors
func ParseSyllabusFile(c echo.Context) error {
	// Make sure the user is authenticated
	userUuid := mustGetUser(c)
	if userUuid == uuid.Nil {
		zero.Error("missing user")
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}

	// Get the file from the request
	file, err := c.FormFile("file")
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusBadRequest, "Please make sure to use the correct file format")
	}

	// Open the file
	fileContent, err := file.Open()
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error opening file")
	}
	defer fileContent.Close()

	// Read the file contents into a byte slice
	fileBytes, err := io.ReadAll(fileContent)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error reading file")
	}

	// Send the file to the external API
	apiUrl := os.Getenv("OPENSYLLABUS_PARSER_API_URL")
	token := os.Getenv("OPENSYLLABUS_PARSER_API_TOKEN")

	if apiUrl == "" || token == "" {
		zero.Error("Missing env variables")
		return c.String(http.StatusUnauthorized, "Error creating request to OS parser.")
	}
	req, err := http.NewRequest("POST", apiUrl, bytes.NewReader(fileBytes))
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error creating request to OS parser.")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error sending request")
	}
	defer resp.Body.Close()

	// Check if the API response was successful
	if resp.StatusCode != http.StatusOK {
		zero.Error(fmt.Sprintf("Error processing file: %v", resp.Status))
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error processing file: %v", resp.Status))
	}

	// Read the response body
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error reading response body")
	}

	// Parse the response body into a JSON object
	var jsonResponse interface{}
	err = json.Unmarshal(responseBody, &jsonResponse)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error parsing response body as JSON")
	}

	// Make sure that the document was a syllabus indeed
	const tresholdSyllabusProbability = 0.5

	syllabusProbability, err := getProbability(jsonResponse)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error getting syllabus probability")
	}
	if syllabusProbability < tresholdSyllabusProbability {
		zero.Errorf("uploaded file did not pass the probability threshold: %d", syllabusProbability)
		return c.String(http.StatusBadRequest, "The provided document does not look like a syllabus!")
	}

	// parse the jsonResponse into a OpenSyllabus struct
	var openSyllabus models.OpenSyllabus
	err = json.Unmarshal(responseBody, &openSyllabus)
	if err != nil {
		fmt.Println(openSyllabus)
		return c.String(http.StatusInternalServerError, "There was a probleming parsing the response body")
	}

	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error parsing response body as JSON")
	}

	formData := models.OpenSyllabusParsed{
		Title:            getTitle(openSyllabus),
		Institutions:     getInstitution(openSyllabus),
		Description:      getDescription(openSyllabus),
		Language:         openSyllabus.Data.Language,
		AcademicFields:   getAcademicField(openSyllabus),
		Readings:         getReadings(openSyllabus),
		LearningOutcomes: getLearningOutcomes(openSyllabus),
		GradingRubric:    getGradingRubric(openSyllabus),
		Schedule:         getSchedule(openSyllabus),
		URLs:             openSyllabus.Data.URLs,
		Assessments:      getAssignments(openSyllabus),
	}

	// Return a success message
	return c.JSON(http.StatusOK, formData)
}
