package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/commonsyllabi/explorer/api/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func getInstution(os models.OpenSyllabus) []models.OpenSyllabusParsedInstitution {
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
	// initialize the academic field array
	var academicFields []string

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
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}

	// Get the file from the request
	file, err := c.FormFile("file")
	if err != nil {
		return c.String(http.StatusBadRequest, "Please make sure to use the correct file format")
	}

	// Open the file
	fileContent, err := file.Open()
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error opening file")
	}
	defer fileContent.Close()

	// Read the file contents into a byte slice
	fileBytes, err := io.ReadAll(fileContent)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error reading file")
	}

	// Send the file to the external API
	apiUrl := os.Getenv("OPENSYLLABUS_PARSER_API_URL")
	token := os.Getenv("OPENSYLLABUS_PARSER_API_TOKEN")
	req, err := http.NewRequest("POST", apiUrl, bytes.NewReader(fileBytes))
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error creating request")
	}
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error sending request")
	}
	defer resp.Body.Close()

	// Check if the API response was successful
	if resp.StatusCode != http.StatusOK {
		return c.String(http.StatusInternalServerError, "Error processing file")
	}

	// Read the response body
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error reading response body")
	}

	// Parse the response body into a JSON object
	var jsonResponse interface{}
	err = json.Unmarshal(responseBody, &jsonResponse)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error parsing response body as JSON")
	}

	// Make sure that the document was a syllabus indeed
	const tresholdSyllabusProbability = 0.5

	syllabusProbability, err := getProbability(jsonResponse)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error getting syllabus probability")
	}
	if syllabusProbability < tresholdSyllabusProbability {
		return c.String(http.StatusBadRequest, "The provided document does not look like a syllabus!")
	}

	// parse the jsonResponse into a OpenSyllabus struct
	var openSyllabus models.OpenSyllabus
	err = json.Unmarshal(responseBody, &openSyllabus)
	if err != nil {
		fmt.Println(openSyllabus)
		return c.String(http.StatusInternalServerError, "There was a probleming parsing the response body")
	}
	fmt.Println(openSyllabus)

	if err != nil {
		return c.String(http.StatusInternalServerError, "Error parsing response body as JSON")
	}

	formData := models.OpenSyllabusParsed{
		Title:          getTitle(openSyllabus),
		Institutions:   getInstution(openSyllabus),
		Language:       openSyllabus.Data.Language,
		AcademicFields: getAcademicField(openSyllabus),
		// Readings:       getReadings(openSyllabus),
		// GradingRubric:  openSyllabus.Data.ExtractedSections.GradingRubric,
		// Assignments:    getAssignments(openSyllabus),
	}

	// Return a success message
	return c.JSON(http.StatusOK, formData)
}
