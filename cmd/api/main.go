package main

import (
	"fmt"
	"os"

	"github.com/commonsyllabi/explorer/api"
	zero "github.com/commonsyllabi/explorer/api/logger"
	"github.com/commonsyllabi/explorer/api/models"
	"github.com/gin-gonic/gin"
)

func main() {
	var mode string
	switch os.Getenv("API_MODE") {
	case "debug":
		mode = gin.DebugMode
		zero.InitLog(0)
	case "test":
		mode = gin.TestMode
		zero.InitLog(1)
	default:
		zero.Log.Warn().Msg("missing env DEBUG, defaulting to false")
		mode = gin.ReleaseMode
		zero.InitLog(1)
	}

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
		zero.Log.Warn().Msg("missing env PORT, defaulting to 8080")
		port = "8080"
	}

	_, err := models.InitDB(url)
	if err != nil {
		zero.Log.Fatal().Msgf("error initializing database: %v", err)
	}

	api.StartServer(port, mode, conf)
}
