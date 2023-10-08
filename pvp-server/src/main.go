package main

import (
	"context"
	"encoding/json"
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
	"tiny.poker/pvp-server/src/logic"
)

var templateFiles, err = readTemplates("src/templates", nil)

type PlayerWebSocket struct {
	PlayerId int
	Socket   *websocket.Conn
}

type WebsocketGame struct {
	GameId           int
	Players          []int
	Hand             logic.HandState
	PlayerWebSockets []PlayerWebSocket
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
var games = []WebsocketGame{}
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
	router.HandleFunc("/game/{gameId}/player/{playerId}/ws", gameWebsocket)

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
		games = append(games, WebsocketGame{
			GameId:  id,
			Players: []int{player1, player2},
			Hand: logic.CreateInitialHandState([]logic.InitalPlayer{
				logic.InitalPlayer{PlayerId: player1, Stack: 20},
				logic.InitalPlayer{PlayerId: player2, Stack: 20},
			}, 1, 2, 0),
			PlayerWebSockets: []PlayerWebSocket{},
		})
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

var websockets = []*websocket.Conn{}

func gameWebsocket(w http.ResponseWriter, r *http.Request) {
	gameId, err := strconv.Atoi(chi.URLParam(r, "gameId"))
	playerId, err := strconv.Atoi(chi.URLParam(r, "playerId"))
	if err != nil {
		panic(err)
	}
	ws, err := websocketUpgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}
	defer ws.Close()
	myGame := WebsocketGame{}
	for _, game := range games {
		if game.GameId == gameId {
			myGame = game
			game.PlayerWebSockets = append(
				game.PlayerWebSockets,
				PlayerWebSocket{PlayerId: playerId, Socket: ws},
			)
		}
	}
	for {
		_, p, err := ws.ReadMessage()
		if err != nil {
			log.Fatalln(err)
			return
		}
		action := Action{}
		err = json.Unmarshal(p, &action)
		if err != nil {
			log.Fatal(err)
		}
		handleAction(&myGame, playerId, action)
	}
}

type Action struct {
	action string
	value  int
}

func handleAction(game *WebsocketGame, playerId int, action Action) {
	seat := -1

	for index, s := range game.Hand.Seats {
		if s.PlayerId == playerId {
			seat = index
		}
	}

	newHandState := game.Hand
	if action.action == "Check" {
		newHandState = logic.PerformCheck(seat, game.Hand)
	}
	if action.action == "Fold" {
		newHandState = logic.PlayerFold(seat, game.Hand)
	}
	if action.action == "Call" {
		newHandState = logic.PlayerCall(seat, game.Hand)
	}
	if action.action == "Raise" {
		newHandState = logic.PlayerRaise(seat, game.Hand, action.value)
	}

	for _, socket := range game.PlayerWebSockets {
		playerState := createHandStateForPlayer(game.Hand, socket.PlayerId)

	}
	fmt.Println(newHandState)
}

type HandStateForPlayer struct {
	PlayerId       int
	PrivateCards   []logic.Card
	Stack          int
	Pot            int
	LastAction     string
	HandStrength   string
	Opponents      []Opponent
	CommunityCards []logic.Card
}

type Opponent struct {
	Stack        int
	PlayerId     int
	Cards        []logic.Card
	LastAction   string
	HandStrength string
}

func createHandStateForPlayer(hand logic.HandState, playerId int) HandStateForPlayer {
	seat := logic.Seat{}
	opponents := []Opponent{}
	for _, s := range hand.Seats {
		if s.PlayerId == playerId {
			seat = s
		} else {
			cards := []logic.Card{}
			if hand.Finished {
				cards = s.Cards
			}
			opponents = append(opponents, Opponent{
				Stack:        s.Stack,
				PlayerId:     s.PlayerId,
				Cards:        cards,
				LastAction:   s.LastAction,
				HandStrength: s.HandStrength,
			})
		}
	}
	playerState := HandStateForPlayer{}
	playerState.PlayerId = playerId
	playerState.PrivateCards = seat.Cards
	playerState.Stack = seat.Stack
	playerState.Pot = hand.Pot
	playerState.LastAction = seat.LastAction
	playerState.HandStrength = seat.HandStrength
	playerState.Opponents = opponents
	playerState.CommunityCards = calculateShownCommunityCards(hand)
	return playerState
}

func calculateShownCommunityCards(hand logic.HandState) []logic.Card {
	cards := []logic.Card{
		logic.Card{Suit: "Hidden", Rank: -1},
		logic.Card{Suit: "Hidden", Rank: -1},
		logic.Card{Suit: "Hidden", Rank: -1},
		logic.Card{Suit: "Hidden", Rank: -1},
		logic.Card{Suit: "Hidden", Rank: -1},
	}

	if hand.Round == "Blinds" && !hand.Finished {
		return cards
	}
	cards[0] = hand.CommunityCards[0]
	cards[1] = hand.CommunityCards[1]
	cards[2] = hand.CommunityCards[2]

	if hand.Round == "Flop" && !hand.Finished {
		return cards
	}

	cards[3] = hand.CommunityCards[3]
	if hand.Round == "Turn" && !hand.Finished {
		return cards
	}
	cards[4] = hand.CommunityCards[4]
	return cards
}
