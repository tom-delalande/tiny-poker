package main

import (
	"database/sql"
	"log"
	"net/http"
	"net/url"
	"tiny-poker/server/src/analytics"

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
		})

		router.Route("/analytics", func(r chi.Router) {
			analytics.AnalyticsEndpoints(r, db)
		})

	})

	log.Default().Println("Listening on port 6006...")
	http.ListenAndServe(":6006", router)
}

func setupDatabase() error {
	u, _ := url.Parse("sqlite:db/database.sqlite3")
	db := dbmate.New(u)
	return db.CreateAndMigrate()
}
