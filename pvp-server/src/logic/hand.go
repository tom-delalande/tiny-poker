package logic

import (
	"log"
	"math"
	"math/rand"
)

type InitalPlayer struct {
	PlayerId int
	Stack    int
}

func CreateInitialHandState(players []InitalPlayer, smallBlindAmount int, bigBlindAmount int, remainingPot int) HandState {
	var hand = HandState{}
	deck := createInitialDeck()

	hand.Seats = []Seat{}
	for index, player := range players {
		card1, d := pop(deck)
		card2, d := pop(d)
		deck = d

		lastAction := "None"
		currentRaise := 0
		stack := player.Stack
		if index == 0 {
			currentRaise = smallBlindAmount
			stack -= smallBlindAmount
			lastAction = "Small Blind"
		}
		if index == 1 {
			currentRaise = bigBlindAmount
			stack -= bigBlindAmount
			lastAction = "Big Blind"
		}
		hand.Seats = append(hand.Seats, Seat{PlayerId: player.PlayerId, Cards: []Card{card1, card2}, Stack: stack, Out: false, LastAction: lastAction, CurrentRaise: currentRaise, HandStrength: "None"})
		hand.CommunityCards = []Card{}
		for i := 0; i < 5; i++ {
			card, newDeck := pop(deck)
			deck = newDeck
			hand.CommunityCards = append(hand.CommunityCards, card)
		}
		hand.Round = "Blinds"
		hand.CurrentAction = CurrentAction{
			SeatInTurn: 2 % len(hand.Seats), // Left of BB
			MinRaise:   bigBlindAmount, LastSeatToRaise: -1}
		hand.SmallBlindAmount = smallBlindAmount
		hand.BigBlindAmount = bigBlindAmount
		hand.Pot = smallBlindAmount + bigBlindAmount + remainingPot
		hand.Deck = deck
		hand.Finished = false
		hand.Winners = []int{}
	}
	return hand
}

func createInitialDeck() []Card {
	deck := []Card{}
	suits := []string{"hearts", "spades", "clubs", "diamonds"}
	for _, suit := range suits {
		for rank := 1; rank <= 13; rank++ {
			deck = append(deck, Card{Rank: rank, Suit: suit})
		}
	}

	rand.Shuffle(len(deck), func(i, j int) { deck[i], deck[j] = deck[j], deck[i] })
	return deck
}

func pop(cards []Card) (Card, []Card) {
	card := cards[0]
	return card, cards[1:]
}

func FinishTurnForSeat(seat int, hand HandState) HandState {
	if hand.CurrentAction.SeatInTurn != seat {
		log.Printf("Attempted to finish turn from wrong seat. seat[%v] seatInTurn[%v]\n", seat, hand.CurrentAction.SeatInTurn)
		return hand
	}
	log.Printf("Finishing turn\n")
	playersIn := []Seat{}
	playersInIndices := []int{}
	for index, player := range hand.Seats {
		if !player.Out {
			playersIn = append(playersIn, player)
			playersInIndices = append(playersInIndices, index)
		}
	}
	if len(playersIn) == 1 {
		hand.Winners = playersInIndices
		return finishHand(hand)
	}

	seatInTurn := hand.CurrentAction.SeatInTurn
	seatInTurn = (seatInTurn + 1) % len(hand.Seats)

	for hand.Seats[seatInTurn].Out == true {
		seatInTurn = (seatInTurn + 1) % len(hand.Seats)
	}

	if seatInTurn == hand.CurrentAction.LastSeatToRaise {
		hand.CurrentAction.SeatInTurn = seatInTurn
		return finishRound(hand)
	}
	if hand.CurrentAction.LastSeatToRaise == -1 {
		hand.CurrentAction.LastSeatToRaise = hand.CurrentAction.SeatInTurn
	}
	hand.CurrentAction.SeatInTurn = seatInTurn
	return hand
}

func finishRound(hand HandState) HandState {
	hand.CurrentAction = CurrentAction{SeatInTurn: 0, MinRaise: 0, LastSeatToRaise: -1}

	everyoneAllIn := true
	seats := []Seat{}
	for _, seat := range hand.Seats {
		seats = append(seats, Seat{
			PlayerId:     seat.PlayerId,
			Cards:        seat.Cards,
			Stack:        seat.Stack,
			Out:          seat.Out,
			LastAction:   "None",
			CurrentRaise: 0,
		})
		log.Printf("seat[%v]", seat)
		if seat.Out == false && seat.Stack > 0 {
			everyoneAllIn = false
		}
	}

	hand.Seats = seats
	round := hand.Round
	if round == "Blinds" {
		hand.Round = "Flop"
	}
	if round == "Flop" {
		hand.Round = "Turn"
	}
	if round == "Turn" {
		hand.Round = "River"
	}

	if round == "River" || everyoneAllIn {
		for _, seat := range hand.Seats {
			cards := append(seat.Cards, hand.CommunityCards...)
			seat.HandStrength = RateHand(cards).HandStrength
		}
		hand.Winners = calculateWinners(hand)
		return finishHand(hand)
	}
	return hand
}

func finishHand(hand HandState) HandState {
	hand = handlePayouts(hand)
	hand.Finished = true
	return hand
}

func calculateWinners(hand HandState) []int {
	handRatings := []float64{}
	for _, seat := range hand.Seats {
		cards := append(seat.Cards, hand.CommunityCards...)
		score := RateHand(cards).Score
		handRatings = append(handRatings, score)
	}

	winningRating := 0.0
	for _, rating := range handRatings {
		if rating > winningRating {
			winningRating = rating
		}
	}
	winners := []int{}
	for index, rating := range handRatings {
		if rating == winningRating {
			winners = append(winners, index)
		}
	}

	return winners
}

func handlePayouts(hand HandState) HandState {
	winnings := int(math.Floor(float64(hand.Pot) / float64(len(hand.Winners))))
	excess := hand.Pot - winnings*len(hand.Winners)

	for _, winner := range hand.Winners {
		hand.Seats[winner].Stack += winnings
	}
	hand.Pot = excess
	return hand
}
