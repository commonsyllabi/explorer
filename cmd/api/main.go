package main

import (
	"fmt"
	"os"

	"github.com/commonsyllabi/explorer/api"
	"github.com/commonsyllabi/explorer/api/config"
	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
)

func main() {

	switch os.Getenv("API_MODE") {
	case "debug":
		zero.Warn("setting API_MODE to DEBUG")
		zero.InitLog(0)
	case "test":
		zero.Warn("setting API_MODE to INFO")
		zero.InitLog(1)
	default:
		zero.Warn("setting API_MODE to WARN")
		zero.InitLog(2)
	}

	var conf config.Config
	conf.DefaultConf()

	url := os.Getenv("DATABASE_URL")
	if url == "" {
		if os.Getenv("DB_USER") == "" || os.Getenv("DB_PASSWORD") == "" || os.Getenv("DB_HOST") == "" || os.Getenv("DB_PORT") == "" {
			zero.Log.Fatal().Msgf("missing env DB_ variables!")
		}

		url = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s", os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"), os.Getenv("DB_PORT"))
	}

	port := os.Getenv("PORT")
	if port == "" {
		zero.Log.Warn().Msg("missing env PORT, defaulting to 8080")
		port = "8080"
	}

	_, err := models.InitDB(url)
	if err != nil {
		zero.Log.Fatal().Msgf("error initializing database: %v", err)
	}

	api.StartServer(port, conf)
}
