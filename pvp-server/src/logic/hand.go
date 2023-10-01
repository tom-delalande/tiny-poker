package logic

import "time"

type InitialPlayer struct {
	PlayerId      int
	Name          string
	StartingStack float32
}

func createInitialHandState(players []InitialPlayer) {
	var hand Hand
	hand.SpecVersion = "1.4.3"
	hand.SiteName = "Tiny Poker"
	hand.NetworkName = "Tiny Poker"
	hand.InternalVersion = "0.1.0"
	hand.Tournament = false

	hand.GameNumber = ""
	hand.StartDateUtc = time.Now().UTC().Format("yyyy-mm-ddThh:mm:ssZ")
	hand.TableName = "Heads Up PVP"
	hand.GameType = "Holdem"
	hand.BetLimit = BetLimit{BetType: "NL"}
	hand.TableSize = 2
	hand.Currency = "NAN"
	hand.DealerSeat = 1
	hand.SmallBlindAmount = 5
	hand.BigBlindAmount = 10
	hand.AnteAmount = 0
	hand.Flags = []string{}
	hand.Rounds = []Round{}
	hand.Players = []Player{}
	for index, player := range players {
		hand.Players = append(hand.Players, Player{Id: player.PlayerId, Seat: index + 1, Name: player.Name, Display: player.Name, StartingStack: player.StartingStack})

	}
}
