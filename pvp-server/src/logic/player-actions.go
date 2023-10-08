package logic

import "math"

func PerformCheck(seat int, hand HandState) HandState {
	if isActionOutOfTurn(seat, hand) {
		return hand
	}
	if hand.CurrentAction.MinRaise > hand.Seats[seat].CurrentRaise {
		return hand
	}

	hand.Seats[seat].LastAction = "Check"
	return hand
}

func PlayerFold(seat int, hand HandState) HandState {
	if isActionOutOfTurn(seat, hand) {
		return hand
	}
	hand.Seats[seat].LastAction = "Fold"
	hand.Seats[seat].Out = true
	return hand
}

func PlayerCall(seat int, hand HandState) HandState {
	if isActionOutOfTurn(seat, hand) {
		return hand
	}
	hand.Seats[seat].LastAction = "Call"
	callAmount := int(math.Min(float64(hand.Seats[seat].Stack), float64(hand.CurrentAction.MinRaise-hand.Seats[seat].CurrentRaise)))
	hand.Seats[seat].Stack -= callAmount
	hand.Pot += callAmount
	return hand
}

func PlayerRaise(seat int, hand HandState, raiseAmount int) HandState {
	if isActionOutOfTurn(seat, hand) {
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
	return hand.CurrentAction.SeatInTurn == seat
}
