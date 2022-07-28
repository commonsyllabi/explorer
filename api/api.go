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
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"

	"github.com/commonsyllabi/explorer/api/auth"
	"github.com/commonsyllabi/explorer/api/handlers"
	zero "github.com/commonsyllabi/explorer/api/logger"
)

var conf Config

// StartServer gets his port and debug in the environment, registers the router, and registers the database closing on exit.
func StartServer(port string, mode string, c Config) {
	conf = c
	gin.SetMode(mode)

	router := SetupRouter()
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
}

// SetupRouter registers all middleware, templates, logging route groups and settings
func SetupRouter() *gin.Engine {
	router := gin.New()

	session_opts := sessions.Options{
		HttpOnly: true,
	}
	store := cookie.NewStore([]byte("secret"))
	store.Options(session_opts)
	router.Use(sessions.Sessions("cosyl_auth", store))

	router.Use(cors.Default())
	if conf.TemplatesDir != "" {
		router.LoadHTMLGlob(conf.TemplatesDir + "/*")
	} else {
		zero.Warn("got empty templates directory, skipping load...")
	}

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

	router.POST("/login", auth.Login)
	router.GET("/logout", auth.Logout)
	router.GET("/dashboard", auth.Authenticate(), auth.Dashboard)

	a := router.Group("/auth")
	{
		a.GET("/confirm", auth.Confirm)
		a.POST("/request-recover", auth.RequestRecover)
		a.POST("/check-recover", auth.Recover)
	}

	syllabi := router.Group("/syllabi")
	{
		syllabi.GET("/", handlers.GetAllSyllabi)
		syllabi.GET("/:id", handlers.GetSyllabus)

		syllabi.POST("/", auth.Authenticate(), handlers.CreateSyllabus)
		syllabi.PATCH("/:id", auth.Authenticate(), handlers.UpdateSyllabus)
		syllabi.DELETE("/:id", auth.Authenticate(), handlers.DeleteSyllabus)
	}

	users := router.Group("/users")
	{
		users.GET("/", handlers.GetAllUsers)
		users.GET("/:id", handlers.GetUser)
		users.POST("/", handlers.CreateUser)

		users.PATCH("/:id", auth.Authenticate(), handlers.UpdateUser)
		users.DELETE("/:id", auth.Authenticate(), handlers.DeleteUser)
	}

	attachments := router.Group("/attachments")
	{
		attachments.GET("/", handlers.GetAllAttachments)
		attachments.GET("/:id", handlers.GetAttachment)

		attachments.POST("/", auth.Authenticate(), handlers.CreateAttachment)
		attachments.PATCH("/:id", auth.Authenticate(), handlers.UpdateAttachment)
		attachments.DELETE("/:id", auth.Authenticate(), handlers.DeleteAttachment)
	}

	collections := router.Group("/collections")
	{
		collections.GET("/", handlers.GetAllCollections)
		collections.GET("/:id", handlers.GetCollection)

		collections.POST("/", auth.Authenticate(), handlers.CreateCollection)
		collections.PATCH("/:id", auth.Authenticate(), handlers.UpdateCollection)
		collections.DELETE("/:id", auth.Authenticate(), handlers.DeleteCollection)

		collections.GET("/:id/syllabi", handlers.GetCollectionSyllabi)
		collections.POST("/:id/syllabi", handlers.AddCollectionSyllabus)

		collections.GET("/:id/syllabi/:syll_id", handlers.GetCollectionSyllabus)
		collections.DELETE("/:id/syllabi/:syll_id", handlers.RemoveCollectionSyllabus)
	}

	router.Use(handleNotFound)

	return router
}

func handlePing(c *gin.Context) {
	c.String(200, "pong")
}

// todo make it a json response
func handleNotFound(c *gin.Context) {
	c.HTML(http.StatusNotFound, "Error", gin.H{
		"msg": "We couldn't find the requested information, sorry :(.",
	})
}
