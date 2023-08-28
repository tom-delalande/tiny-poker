package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"tiny-poker/server/src/analytics"
	"tiny-poker/server/src/landing"

	"github.com/amacneil/dbmate/v2/pkg/dbmate"
	_ "github.com/amacneil/dbmate/v2/pkg/driver/sqlite"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	_ "github.com/mattn/go-sqlite3"
)

func main() {
	err := setupDatabase()
	if err != nil {
		panic(err)
	}
	db, err := sql.Open("sqlite3", "db/database.sqlite3")
	if err != nil {
		panic(err)
	}
	router := chi.NewRouter()
	router.Use(middleware.Logger)

	router.Route("/api", func(router chi.Router) {
		router.Get("/health-check", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			buildVersion := os.Getenv("BUILD_VERSION")
			w.Write([]byte(buildVersion))
		})
		router.Route("/analytics", func(r chi.Router) {
			analytics.AnalyticsEndpoints(r, db)
		})
	})

	router.Route("/landing", func(r chi.Router) {
		landing.LandingEndpoints(r)
	})
	port := os.Getenv("PORT")
	server := &http.Server{Addr: fmt.Sprintf(":%s", port), Handler: router}
	log.Default().Println(fmt.Sprintf("Listening on port %s...", port))
	server.ListenAndServe()

	// Graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop
	server.Shutdown(context.Background())

}

func setupDatabase() error {
	u, _ := url.Parse("sqlite:db/database.sqlite3")
	db := dbmate.New(u)
	return db.CreateAndMigrate()
}
