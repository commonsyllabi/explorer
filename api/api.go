package api

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/commonsyllabi/explorer/api/auth"
	"github.com/commonsyllabi/explorer/api/config"
	"github.com/commonsyllabi/explorer/api/handlers"
	zero "github.com/commonsyllabi/explorer/api/logger"
)

var conf config.Config

// StartServer gets his port and debug in the environment, registers the router, and registers the database closing on exit.
func StartServer(port string, mode string, c config.Config) {
	conf = c

	err := os.MkdirAll(c.UploadsDir, os.ModePerm)
	if err != nil {
		panic(err)
	}

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

	if os.Getenv("API_MODE") != "test" {
		ch := make(chan os.Signal, 2)
		signal.Notify(ch, os.Interrupt, syscall.SIGTERM)
		<-ch // block until signal received
	}

	zero.Info("shutting down...")
	s.Shutdown(context.Background())
}

// SetupRouter registers all middleware, templates, logging route groups and settings
func SetupRouter() *echo.Echo {
	r := echo.New()

	store := sessions.NewCookieStore([]byte("cosyl_auth"))
	store.Options.HttpOnly = true
	r.Use(session.Middleware(store))
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())
	r.Use(middleware.Recover())
	r.Use(middleware.BodyLimit("16M"))

	r.Static("/uploads", conf.UploadsDir)

	r.GET("/ping", handlePing)

	r.POST("/login", auth.Login)
	r.GET("/logout", auth.Logout)
	r.GET("/dashboard", auth.Dashboard)

	a := r.Group("/auth")
	{
		a.GET("/confirm", auth.Confirm)
		a.POST("/request-recover", auth.RequestRecover)
		a.POST("/check-recover", auth.Recover)
	}

	syllabi := r.Group("/syllabi")
	{
		syllabi.GET("/", handlers.GetSyllabi)
		syllabi.GET("/:id", handlers.GetSyllabus)

		syllabi.POST("/", handlers.CreateSyllabus)
		syllabi.PATCH("/:id", handlers.UpdateSyllabus)
		syllabi.DELETE("/:id", handlers.DeleteSyllabus)

		syllabi.POST("/:id/institutions", handlers.AddSyllabusInstitution)
		syllabi.DELETE("/:id/institutions/:inst_id", handlers.RemoveSyllabusInstitution)

		syllabi.POST("/:id/institutions", handlers.AddSyllabusAttachment)
		syllabi.DELETE("/:id/institutions/:inst_id", handlers.RemoveSyllabusAttachment)
	}

	users := r.Group("/users")
	{
		users.GET("/", handlers.GetAllUsers)
		users.GET("/:id", handlers.GetUser)
		users.POST("/", handlers.CreateUser)

		users.PATCH("/:id", handlers.UpdateUser)
		users.DELETE("/:id", handlers.DeleteUser)

		users.POST("/:id/institutions", handlers.AddUserInstitution)
		users.DELETE("/:id/institutions/:inst_id", handlers.RemoveUserInstitution)
	}

	attachments := r.Group("/attachments")
	{
		attachments.GET("/", handlers.GetAllAttachments)
		attachments.GET("/:id", handlers.GetAttachment)

		attachments.POST("/", handlers.CreateAttachment)
		attachments.PATCH("/:id", handlers.UpdateAttachment)
		attachments.DELETE("/:id", handlers.DeleteAttachment)
	}

	collections := r.Group("/collections")
	{
		collections.GET("/", handlers.GetAllCollections)
		collections.GET("/:id", handlers.GetCollection)

		collections.POST("/", handlers.CreateCollection)
		collections.PATCH("/:id", handlers.UpdateCollection)
		collections.DELETE("/:id", handlers.DeleteCollection)

		collections.GET("/:id/syllabi", handlers.GetCollectionSyllabi)
		collections.GET("/:id/syllabi/:syll_id", handlers.GetCollectionSyllabus)
		collections.POST("/:id/syllabi", handlers.AddCollectionSyllabus)
		collections.DELETE("/:id/syllabi/:syll_id", handlers.RemoveCollectionSyllabus)
	}

	r.GET("/", handleNotFound)
	r.POST("/", handleNotFound)

	return r
}

func injectConfig(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		c.Set("config", conf)
		return nil
	}
}

func handlePing(c echo.Context) error {
	return c.String(200, "pong")
}

func handleNotFound(c echo.Context) error {
	return c.String(http.StatusNotFound, "We couldn't find the requested information, sorry :(.")
}
