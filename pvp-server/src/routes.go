package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi"
	"golang.org/x/exp/slices"
	"tiny.poker/pvp-server/src/templates"
)

func home(w http.ResponseWriter, r *http.Request) {
	component := templates.Index()
	component.Render(context.Background(), w)
}

func queue(w http.ResponseWriter, r *http.Request) {
	id += 1
	playersInQueue = append(playersInQueue, id)
	component := templates.Queue(id)
	component.Render(context.Background(), w)
	go createAvailableGames()
}

func poll(w http.ResponseWriter, r *http.Request) {
	playerId, err := strconv.Atoi(chi.URLParam(r, "playerId"))
	if err != nil {
		panic(err)
	}
	for _, game := range games {
		if slices.Contains(game.Players, playerId) {
			playerState := createHandStateForPlayer(game.GameId, game.Hand, playerId)
			templates.Game(playerState).Render(context.Background(), w)
			return
		}
	}

	templates.Queue(playerId).Render(context.Background(), w)
}

func raiseMenu(w http.ResponseWriter, r *http.Request) {
	playerId, err := strconv.Atoi(chi.URLParam(r, "playerId"))
	if err != nil {
		panic(err)
	}
	for _, game := range games {
		if slices.Contains(game.Players, playerId) {
			playerState := createHandStateForPlayer(game.GameId, game.Hand, playerId)
			templates.RaiseMenu(playerState.Actions).Render(context.Background(), w)
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
			templates.Actions(playerState.Actions).Render(context.Background(), w)
			return
		}
	}
}

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
