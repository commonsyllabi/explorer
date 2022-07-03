package main

import (
	"fmt"
	"os"

	"github.com/commonsyllabi/explorer/api"
	zero "github.com/commonsyllabi/explorer/api/logger"
)

func main() {
	debug := false
	switch os.Getenv("DEBUG") {
	case "true":
		debug = true
		zero.InitLog(0)
	case "false":
		debug = false
		zero.InitLog(1)
	default:
		zero.Log.Warn().Msg("Missing env DEBUG, defaulting to false")
		zero.InitLog(1)
	}

	zero.Info("starting explorer")

	var conf api.Config
	conf.DefaultConf()

	url := os.Getenv("DATABASE_URL")
	if url == "" {
		zero.Log.Warn().Msg("missing DATABASE_URL, composing from env...")
		if os.Getenv("DB_USER") == "" || os.Getenv("DB_PASSWORD") == "" || os.Getenv("DB_HOST") == "" || os.Getenv("DB_PORT") == "" {
			zero.Log.Fatal().Msgf("missing env DB_ variables!")
		}

		url = fmt.Sprintf("postgres://%s:%s@%s:%s/%s", os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_NAME"))
	}

	port := os.Getenv("PORT")
	if port == "" {
		zero.Log.Warn().Msg("Missing env PORT, defaulting to 8080")
		port = "8080"
	}

	// _, err := models.InitDB(url)
	// if err != nil {
	// 	zero.Log.Fatal().Msgf("Error initializing D: %v", err)
	// }

	err := api.StartServer(port, debug, conf)
	if err != nil {
		zero.Log.Fatal().Msgf("Error starting server: %v", err)
	}
}
