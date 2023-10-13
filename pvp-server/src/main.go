package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	_ "github.com/kr/pretty"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	router := chi.NewRouter()
	router.Use(middleware.Logger)
	router.Use(middleware.Compress(5))

	router.Get("/", home)
	router.Post("/queue", queue)
	router.Get("/queue/poll/{playerId}", poll)

	router.HandleFunc("/game/{gameId}/player/{playerId}/ws", gameWebsocket)
	router.Get("/raise-menu/{playerId}", raiseMenu)
	router.Get("/raise-menu/{playerId}/back", raiseMenuBack)

	value, exists := os.LookupEnv("PORT")
	if !exists {
		value = "8081"
	}
	server := &http.Server{Addr: fmt.Sprintf(":%s", value), Handler: router}
	log.Default().Println(fmt.Sprintf("Listening on port %s...", value))
	server.ListenAndServe()

	// Graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop
	server.Shutdown(context.Background())
}
