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

func getTitle(os models.OpenSyllabus) string {
	var title string
	var maxProbability float64

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
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error processing file")
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

	/// Make sure that the document was a syllabus indeed
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

	// parse the syllabus into a OpenSyllabus struct
	var OpenSyllabus models.OpenSyllabus
	err = json.Unmarshal(responseBody, &OpenSyllabus)
	if err != nil {
		zero.Error(err.Error())
		return c.String(http.StatusInternalServerError, "Error parsing response body as JSON")
	}

	formData := models.IFormData{
		Title: getTitle(OpenSyllabus),
	}

	// Return a success message
	return c.JSON(http.StatusOK, formData)
}
