package logic

import (
	"log"
	"math"
)

func PerformCheckFold(seat int, hand HandState) HandState {
	if isActionOutOfTurn(seat, hand) {
		return hand
	}
	if hand.CurrentAction.MinRaise > hand.Seats[seat].CurrentRaise {
		hand.Seats[seat].LastAction = "Fold"
		hand.Seats[seat].Out = true
	} else {
		hand.Seats[seat].LastAction = "Check"
	}

	return hand
}

func PlayerCall(seat int, hand HandState) HandState {
	log.Printf("Handling player call.")
	x := isActionOutOfTurn(seat, hand)

	if isActionOutOfTurn(seat, hand) {
		log.Printf("Wut? %v %v %v", seat, hand.CurrentAction.SeatInTurn, x)
		return hand
	}
	log.Printf("Handling player call also.")
	hand.Seats[seat].LastAction = "Call"
	callAmount := int(math.Min(float64(hand.Seats[seat].Stack), float64(hand.CurrentAction.MinRaise-hand.Seats[seat].CurrentRaise)))
	hand.Seats[seat].Stack -= callAmount
	log.Printf("Calling. callAmount[%v] pot[%v]\n", callAmount, hand.Pot)
	hand.Pot += callAmount
	return hand
}

func PlayerRaise(seat int, hand HandState, raiseAmount int) HandState {
	if isActionOutOfTurn(seat, hand) == true {
		return hand
	}
	player := hand.Seats[seat]
	player.LastAction = "Raise"
	player.Stack -= raiseAmount
	hand.Pot += raiseAmount
	hand.CurrentAction.MinRaise = raiseAmount + player.CurrentRaise
	player.CurrentRaise = raiseAmount + player.CurrentRaise
	hand.CurrentAction.LastSeatToRaise = seat
	hand.Seats[seat] = player
	return hand
}

func isActionOutOfTurn(seat int, hand HandState) bool {
	if hand.CurrentAction.SeatInTurn != seat {
		log.Println("Action performed out of turn.")
	}
	return hand.CurrentAction.SeatInTurn != seat
}
