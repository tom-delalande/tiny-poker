package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"text/template"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/gorilla/websocket"
	"golang.org/x/exp/slices"
)

var templateFiles, err = readTemplates("src/templates", nil)

type Game struct {
	GameId         int
	Players        []int
	CommunityCards []Card
}

type CardSuit string

const (
	CardSuitSpades   CardSuit = "spades"
	CardSuitHeats    CardSuit = "heats"
	CardSuitDiamonds CardSuit = "diamonds"
	CardSuitClubs    CardSuit = "clubs"
	CardSuitHidden   CardSuit = "hidden"
)

type Card struct {
	Suit CardSuit
	Rank int
}

var playersInQueue = []int{}
var games = []Game{}
var id = 0
var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func main() {
	if err != nil {
		panic(err)
	}
	router := chi.NewRouter()
	router.Use(middleware.Logger)
	router.Use(middleware.Compress(5))

	router.Get("/", home)
	router.Post("/queue", queue)
	router.Get("/queue/poll/{playerId}", poll)
	router.HandleFunc("/game/{gameId}/ws", gameWebsocket)

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

func home(w http.ResponseWriter, r *http.Request) {
	templateFiles.ExecuteTemplate(w, "index.html", nil)
}
func queue(w http.ResponseWriter, r *http.Request) {
	id += 1
	playersInQueue = append(playersInQueue, id)
	templateFiles.ExecuteTemplate(w, "queue", struct {
		PlayerId int
	}{PlayerId: id})
	go createAvailableGames()
}

func createAvailableGames() {
	for len(playersInQueue) > 1 {
		id += 1
		player1 := playersInQueue[0]
		player2 := playersInQueue[1]
		playersInQueue = playersInQueue[2:]
		games = append(games, Game{GameId: id, Players: []int{player1, player2}, CommunityCards: []Card{{Rank: 1, Suit: CardSuitDiamonds}, {Rank: 0, Suit: CardSuitHidden}}})
	}
}

func poll(w http.ResponseWriter, r *http.Request) {
	playerId, err := strconv.Atoi(chi.URLParam(r, "playerId"))
	if err != nil {
		panic(err)
	}
	for _, game := range games {
		if slices.Contains(game.Players, playerId) {
			templateFiles.ExecuteTemplate(w, "game", game)
			return
		}
	}

	templateFiles.ExecuteTemplate(w, "queue", struct {
		PlayerId int
	}{PlayerId: playerId})
}

func readTemplates(rootDir string, funcMap template.FuncMap) (*template.Template, error) {
	cleanRoot := filepath.Clean(rootDir)
	pfx := len(cleanRoot) + 1
	root := template.New("")

	err := filepath.Walk(cleanRoot, func(path string, info os.FileInfo, e1 error) error {
		if !info.IsDir() && strings.HasSuffix(path, ".html") {
			if e1 != nil {
				return e1
			}

			b, e2 := os.ReadFile(path)
			if e2 != nil {
				return e2
			}

			name := path[pfx:]
			t := root.New(name).Funcs(funcMap)
			_, e2 = t.Parse(string(b))
			if e2 != nil {
				return e2
			}
		}

		return nil
	})

	return root, err
}

func gameWebsocket(w http.ResponseWriter, r *http.Request) {
	_, err := strconv.Atoi(chi.URLParam(r, "gameId"))
	if err != nil {
		panic(err)
	}
	ws, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}
	defer ws.Close()
	ws.WriteMessage(websocket.TextMessage, []byte("Hello, websockets!"))
	writer, err := ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		return
	}
	writer.Close()
	for {
		_, p, err := ws.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		log.Println(string(p))
	}
}
