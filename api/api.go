package api

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"

	"github.com/commonsyllabi/explorer/api/handlers"
	zero "github.com/commonsyllabi/explorer/api/logger"
)

var conf Config

// StartServer gets his port and debug in the environment, registers the router, and registers the database closing on exit.
func StartServer(port string, mode string, c Config) error {
	conf = c
	gin.SetMode(mode)

	router, err := setupRouter()
	if err != nil {
		return err
	}

	s := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	// from https://gist.github.com/ivan3bx/b0f14449803ce5b0aa72afaa1dfc75e1
	go func() {
		zero.Infof("server starting on port %s", port)
		if err := s.ListenAndServe(); err != http.ErrServerClosed {
			panic(err)
		}
	}()

	if gin.Mode() != gin.TestMode {
		ch := make(chan os.Signal, 2)
		signal.Notify(ch, os.Interrupt, syscall.SIGTERM)
		<-ch // block until signal received
	}

	zero.Info("shutting down...")
	s.Shutdown(context.Background())
	// err = models.Shutdown()

	return err
}

// setupRouter registers all route groups
func setupRouter() (*gin.Engine, error) {
	router := gin.New()

	router.Use(cors.Default())
	router.LoadHTMLGlob(conf.TemplatesDir + "/*")

	router.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	}))

	router.MaxMultipartMemory = 16 << 20 // 16 MiB for uploads
	router.Use(gin.Recovery())

	cwd, _ := os.Getwd()
	publicPath := filepath.Join(cwd, conf.PublicDir)

	router.Use(static.Serve("/", static.LocalFile(publicPath, false)))

	router.GET("/ping", handlePing)

	syllabi := router.Group("/syllabi")
	{
		syllabi.GET("/", handlers.GetAllSyllabi)
		syllabi.POST("/", handlers.CreateSyllabus)
		syllabi.PATCH("/:id", handlers.UpdateSyllabus)
		syllabi.GET("/:id", handlers.GetSyllabus)
		syllabi.DELETE("/:id", handlers.DeleteSyllabus)
	}

	users := router.Group("/users")
	{
		users.GET("/", handlers.GetAllUsers)
		users.POST("/", handlers.CreateUser)
		users.PATCH("/:id", handlers.UpdateUser)
		users.GET("/:id", handlers.GetUser)
		users.DELETE("/:id", handlers.DeleteUser)
	}

	resources := router.Group("/resources")
	{
		resources.GET("/", handlers.GetAllResources)
		resources.POST("/", handlers.CreateResource)
		resources.PATCH("/:id", handlers.UpdateResource)
		resources.GET("/:id", handlers.GetResource)
		resources.DELETE("/:id", handlers.DeleteResource)
	}

	collections := router.Group("/collections")
	{
		collections.GET("/", handlers.GetAllCollections)
		collections.POST("/", handlers.CreateCollection)
		collections.PATCH("/:id", handlers.UpdateCollection)
		collections.GET("/:id", handlers.GetCollection)
		collections.DELETE("/:id", handlers.DeleteCollection)
	}

	router.Use(handleNotFound)

	return router, nil
}

func handlePing(c *gin.Context) {
	c.String(200, "pong")
}

func handleNotFound(c *gin.Context) {
	c.HTML(http.StatusNotFound, "Error", gin.H{
		"msg": "We couldn't find the requested information, sorry :(.",
	})
}
