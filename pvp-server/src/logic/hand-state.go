package logic

type Seat struct {
	PlayerId     int
	Cards        []Card
	Stack        int
	Out          bool
	LastAction   string
	CurrentRaise int
	HandStrength string
}

type Card struct {
	Suit string
	Rank int
}

type CurrentAction struct {
	SeatInTurn      int
	MinRaise        int
	LastSeatToRaise int
}

type HandState struct {
	Seats            []Seat
	SmallBlindAmount int
	BigBlindAmount   int
	CurrentAction    CurrentAction
	Round            string
	CommunityCards   []Card
	Pot              int
	Deck             []Card
	Finished         bool
	Winners          []int
}
