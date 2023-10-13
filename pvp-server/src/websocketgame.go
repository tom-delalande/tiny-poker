package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/kr/pretty"
	"tiny.poker/pvp-server/src/logic"
	"tiny.poker/pvp-server/src/templates"
	_ "tiny.poker/pvp-server/src/templates"
)

type PlayerWebSocket struct {
	PlayerId    int
	Socket      *websocket.Conn
	PlayerState templates.HandStateForPlayer
}

type WebsocketGame struct {
	GameId           int
	Players          []int
	Hand             logic.HandState
	PlayerWebSockets []*PlayerWebSocket
}

var playersInQueue = []int{}
var games = []*WebsocketGame{}
var id = 0
var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
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

func createHandStateForPlayer(gameId int, hand logic.HandState, playerId int) templates.HandStateForPlayer {
	seat := logic.Seat{}
	seatIndex := 0
	opponents := []templates.Opponent{}
	for index, s := range hand.Seats {
		if s.PlayerId == playerId {
			seat = s
			seatIndex = index
		} else {
			cards := []logic.Card{}
			if hand.Finished {
				cards = s.Cards
			}
			opponents = append(opponents, templates.Opponent{
				Stack:        s.Stack,
				PlayerId:     s.PlayerId,
				Cards:        cards,
				LastAction:   s.LastAction,
				HandStrength: s.HandStrength,
			})
		}
	}
	playerState := templates.HandStateForPlayer{}
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

	playerState.Actions = templates.ActionBlock{
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

func sendNewUIForChangesInPlayerState(prev templates.HandStateForPlayer, next templates.HandStateForPlayer, ws *websocket.Conn) {
	writer, err := ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templates.Opponents(next.Opponents).Render(context.Background(), writer)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templates.CommunityCards(next.CommunityCards).Render(context.Background(), writer)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templates.PocketCards(next.PocketCards).Render(context.Background(), writer)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templates.MyHandStrength(next.HandStrength).Render(context.Background(), writer)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templates.MyStack(next.Stack).Render(context.Background(), writer)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templates.MyLastAction(next.LastAction).Render(context.Background(), writer)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templates.Actions(next.Actions).Render(context.Background(), writer)

	writer, err = ws.NextWriter(websocket.TextMessage)
	if err != nil {
		log.Println(err)
		ws.Close()
	}
	templates.Pot(next.Pot).Render(context.Background(), writer)
	writer.Close()
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

func scheduleNextHand(game *WebsocketGame) {
	time.Sleep(3 * time.Second)

	nextHand := logic.PrepareNextHand(game.Hand)
	game.Hand = nextHand
	printableHandState := game.Hand
	printableHandState.Deck = []logic.Card{}
	fmt.Printf("Hand state updated\n. %# v", pretty.Formatter(printableHandState))
	updateHandForPlayers(game)
}

type Action struct {
	Action string
	Amount int
}

func updateHandForPlayers(game *WebsocketGame) {
	for _, socket := range game.PlayerWebSockets {
		oldPlayerState := socket.PlayerState
		newPlayerState := createHandStateForPlayer(game.GameId, game.Hand, socket.PlayerId)
		socket.PlayerState = newPlayerState
		sendNewUIForChangesInPlayerState(oldPlayerState, newPlayerState, socket.Socket)
	}

}
