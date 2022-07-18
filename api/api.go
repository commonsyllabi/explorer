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
func StartServer(port string, mode string, c Config) error {
	conf = c
	gin.SetMode(mode)

	router, err := SetupRouter()
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

// SetupRouter registers all middleware, templates, logging route groups and settings
func SetupRouter() (*gin.Engine, error) {
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

	resources := router.Group("/resources")
	{
		resources.GET("/", handlers.GetAllResources)
		resources.GET("/:id", handlers.GetResource)

		resources.POST("/", auth.Authenticate(), handlers.CreateResource)
		resources.PATCH("/:id", auth.Authenticate(), handlers.UpdateResource)
		resources.DELETE("/:id", auth.Authenticate(), handlers.DeleteResource)
	}

	collections := router.Group("/collections")
	{
		collections.GET("/", handlers.GetAllCollections)
		collections.GET("/:id", handlers.GetCollection)

		collections.POST("/", auth.Authenticate(), handlers.CreateCollection)
		collections.PATCH("/:id", auth.Authenticate(), handlers.UpdateCollection)
		collections.DELETE("/:id", auth.Authenticate(), handlers.DeleteCollection)
	}

	router.Use(handleNotFound)

	return router, nil
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
