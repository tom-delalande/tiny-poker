package logic

import (
	"math/rand"
)

type InitalPlayer struct {
	PlayerId int
	Stack    int
}

func CreateInitialHandState(players []InitalPlayer, smallBlindAmount int, bigBlindAmount int, remainingPot int) {
	var hand = HandState{}
	deck := createInitialDeck()

	hand.Seats = []Seat{}
	for index, player := range players {
		card1, deck := pop(deck)
		card2, deck := pop(deck)
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
