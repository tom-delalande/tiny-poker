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
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/gorilla/websocket"
	"github.com/kr/pretty"
	_ "github.com/kr/pretty"
	"golang.org/x/exp/slices"
	"tiny.poker/pvp-server/src/logic"
)

var templateFiles, err = readTemplates("src/templates", nil)

type PlayerWebSocket struct {
	PlayerId    int
	Socket      *websocket.Conn
	PlayerState HandStateForPlayer
}

type WebsocketGame struct {
	GameId           int
	Players          []int
	Hand             logic.HandState
	PlayerWebSockets []*PlayerWebSocket
}

type CardSuit string

type Card struct {
	Suit CardSuit
	Rank int
}

var playersInQueue = []int{}
var games = []*WebsocketGame{}
var id = 0
var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
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
		games = append(games, &WebsocketGame{
			GameId:  id,
			Players: []int{player1, player2},
			Hand: logic.CreateInitialHandState([]logic.InitalPlayer{
				{PlayerId: player1, Stack: 20},
				{PlayerId: player2, Stack: 20},
			}, 1, 2, 0),
			PlayerWebSockets: []*PlayerWebSocket{},
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
			playerState := createHandStateForPlayer(game.GameId, game.Hand, playerId)
			templateFiles.ExecuteTemplate(w, "game", playerState)
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
		ws.Close()
	}
	defer ws.Close()
	myGame := &WebsocketGame{}
	for _, game := range games {
		if game.GameId == gameId {
			myGame = game
			initalPlayerState := createHandStateForPlayer(game.GameId, game.Hand, playerId)
			game.PlayerWebSockets = append(
				game.PlayerWebSockets,
				&PlayerWebSocket{PlayerId: playerId, Socket: ws, PlayerState: initalPlayerState},
			)
			sendNewUIForChangesInPlayerState(initalPlayerState, initalPlayerState, ws)
		}
	}
	for {
		_, p, err := ws.ReadMessage()
		if err != nil {
			log.Println(err)
			ws.Close()
			return
		}
		action := ActionRequest{}
		err = json.Unmarshal(p, &action)
		if err != nil {
			log.Println(err)
			ws.Close()
		}
		amount, err := strconv.Atoi(action.Amount)
		if err != nil {
			amount = 0
		}
		handleAction(myGame, playerId, Action{Action: action.Action, Amount: amount})
	}
}

type ActionRequest struct {
	Action string
	Amount string
}

type Action struct {
	Action string
	Amount int
}

func handleAction(game *WebsocketGame, playerId int, action Action) {
	seat := -1

	for index, s := range game.Hand.Seats {
		if s.PlayerId == playerId {
			seat = index
		}
	}

	newHandState := game.Hand
	if action.Action == "CheckFold" {
		newHandState = logic.PerformCheckFold(seat, game.Hand)
	}
	if action.Action == "Call" {
		newHandState = logic.PlayerCall(seat, game.Hand)
	}
	if action.Action == "Raise" {
		newHandState = logic.PlayerRaise(seat, game.Hand, action.Amount)
	}

	newHandState = logic.FinishTurnForSeat(seat, newHandState)
	inPlayers := 0
	for _, seats := range newHandState.Seats {
		if seats.Stack > 0 {
			inPlayers = inPlayers + 1
		}
	}

	if newHandState.Finished && inPlayers == 1 {
		newHandState.GameFinished = true
	}

	game.Hand = newHandState
	printableHandState := game.Hand
	printableHandState.Deck = []logic.Card{}
	fmt.Printf("Hand state updated\n. %# v", pretty.Formatter(printableHandState))
	updateHandForPlayers(game)

	if game.Hand.Finished && !game.Hand.GameFinished {
		go scheduleNextHand(game)
	}
}

func updateHandForPlayers(game *WebsocketGame) {
	for _, socket := range game.PlayerWebSockets {
		oldPlayerState := socket.PlayerState
		newPlayerState := createHandStateForPlayer(game.GameId, game.Hand, socket.PlayerId)
		socket.PlayerState = newPlayerState
		sendNewUIForChangesInPlayerState(oldPlayerState, newPlayerState, socket.Socket)
	}

}

type HandStateForPlayer struct {
	PlayerId       int
	GameId         int
	PocketCards    []logic.Card
	Stack          int
	Pot            int
	LastAction     string
	HandStrength   string
	Opponents      []Opponent
	CommunityCards []logic.Card
	Actions        ActionBlock
}

type ActionBlock struct {
	CheckFoldLabel    string
	CheckFoldDisabled bool
	CallDisabled      bool
	CallAmount        int
	RaiseDisabled     bool
	RaiseAmounts      []int
	PlayerId          int
	HandFinished      bool
	GameFinished      bool
}
type AvailableAction struct {
	Type         string
	RaiseAmounts []int
	CallAmount   int
	Disabled     bool
}

type Opponent struct {
	Stack        int
	PlayerId     int
	Cards        []logic.Card
	LastAction   string
	HandStrength string
}

func createHandStateForPlayer(gameId int, hand logic.HandState, playerId int) HandStateForPlayer {
	seat := logic.Seat{}
	seatIndex := 0
	opponents := []Opponent{}
	for index, s := range hand.Seats {
		if s.PlayerId == playerId {
			seat = s
			seatIndex = index
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
	playerState.GameId = gameId
	playerState.PlayerId = playerId
	playerState.PocketCards = seat.Cards
	playerState.Stack = seat.Stack
	playerState.Pot = hand.Pot
	playerState.LastAction = seat.LastAction
	playerState.HandStrength = seat.HandStrength
	playerState.Opponents = opponents
	playerState.CommunityCards = calculateShownCommunityCards(hand)

	currentAction := hand.CurrentAction
	outOfTurn := currentAction.SeatInTurn != seatIndex
	checkFoldLabel := "Check"
	checkDisabled := outOfTurn
	if currentAction.MinRaise > seat.CurrentRaise {
		checkDisabled = outOfTurn || currentAction.MinRaise <= seat.CurrentRaise
		checkFoldLabel = "Fold"
	}
	callAmount := 0
	if !outOfTurn && currentAction.MinRaise > seat.CurrentRaise {
		callAmount = currentAction.MinRaise - seat.CurrentRaise
	}
	callDisabled := outOfTurn || currentAction.MinRaise <= seat.CurrentRaise
	raiseDisabled := outOfTurn || currentAction.MinRaise > seat.Stack || seat.Stack == 0
	minRaise := min(currentAction.MinRaise+1, seat.Stack)
	raiseAmounts := []int{minRaise}

	quarter := currentAction.MinRaise + (seat.Stack-currentAction.MinRaise)/4
	if minRaise != quarter {
		raiseAmounts = append(raiseAmounts, quarter)
	}
	half := currentAction.MinRaise + (seat.Stack-currentAction.MinRaise)/2
	if half != quarter && half != minRaise {
		raiseAmounts = append(raiseAmounts, half)
	}
	full := currentAction.MinRaise + (seat.Stack - currentAction.MinRaise)
	if full != quarter && full != minRaise && full != half {
		raiseAmounts = append(raiseAmounts, full)
	}

	playerState.Actions = ActionBlock{
		PlayerId:          playerId,
		RaiseDisabled:     raiseDisabled,
		CheckFoldDisabled: checkDisabled,
		CallDisabled:      callDisabled,
		CallAmount:        callAmount,
		RaiseAmounts:      raiseAmounts,
		CheckFoldLabel:    checkFoldLabel,
		HandFinished:      hand.Finished,
		GameFinished:      hand.GameFinished,
	}
	fmt.Printf("Hand state updated for player\n. %v %# v", playerId, pretty.Formatter(playerState))
	return playerState
}

func calculateShownCommunityCards(hand logic.HandState) []logic.Card {
	cards := []logic.Card{
		{Suit: "Hidden", Rank: -1},
		{Suit: "Hidden", Rank: -1},
		{Suit: "Hidden", Rank: -1},
		{Suit: "Hidden", Rank: -1},
		{Suit: "Hidden", Rank: -1},
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

func sendNewUIForChangesInPlayerState(prev HandStateForPlayer, next HandStateForPlayer, ws *websocket.Conn) {
	writer, err := ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templateFiles.ExecuteTemplate(writer, "opponents", next.Opponents)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templateFiles.ExecuteTemplate(writer, "communityCards", next.CommunityCards)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templateFiles.ExecuteTemplate(writer, "pocketCards", next.PocketCards)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templateFiles.ExecuteTemplate(writer, "handStrength", next.HandStrength)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templateFiles.ExecuteTemplate(writer, "playerStack", next.Stack)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templateFiles.ExecuteTemplate(writer, "myLastAction", next.LastAction)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templateFiles.ExecuteTemplate(writer, "actions", next.Actions)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templateFiles.ExecuteTemplate(writer, "pot", next.Pot)
	writer.Close()
}

func raiseMenu(w http.ResponseWriter, r *http.Request) {
	playerId, err := strconv.Atoi(chi.URLParam(r, "playerId"))
	if err != nil {
		panic(err)
	}
	for _, game := range games {
		if slices.Contains(game.Players, playerId) {
			playerState := createHandStateForPlayer(game.GameId, game.Hand, playerId)
			templateFiles.ExecuteTemplate(w, "raiseMenu", playerState.Actions)
			return
		}
	}
}

func raiseMenuBack(w http.ResponseWriter, r *http.Request) {
	playerId, err := strconv.Atoi(chi.URLParam(r, "playerId"))
	if err != nil {
		panic(err)
	}
	for _, game := range games {
		if slices.Contains(game.Players, playerId) {
			playerState := createHandStateForPlayer(game.GameId, game.Hand, playerId)
			templateFiles.ExecuteTemplate(w, "actions", playerState.Actions)
			return
		}
	}
}

func scheduleNextHand(game *WebsocketGame) {
	time.Sleep(3 * time.Second)

	nextHand := logic.PrepareNextHand(game.Hand)
	game.Hand = nextHand
	printableHandState := game.Hand
	printableHandState.Deck = []logic.Card{}
	fmt.Printf("Hand state updated\n. %# v", pretty.Formatter(printableHandState))
	updateHandForPlayers(game)
}
