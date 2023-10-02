package logic

type Hand struct {
	SpecVersion      string
	SiteName         string
	NetworkName      string
	InternalVersion  string
	Tournament       bool
	TournamentInfo   TournamentInfo
	GameNumber       string
	StartDateUtc     string
	TableName        string
	GameType         string
	BetLimit         BetLimit
	TableSize        int
	Currency         string
	DealerSeat        int
	SmallBlindAmount float32
	BigBlindAmount   float32
	AnteAmount       float32
	Flags            []string
	Players          []Player
	Rounds           []Round
	Pots             []Pot
}

type TournamentInfo struct {
	TournamentNumber string
	Name             string
	StartDateUtc     string
	Currency         string
	BuyInAmount      float32
	FeeAmount        float32
	BountyFeeAmount  float32
	InitialStack     int
	TournamentType   string
	Flags            []string
	Speed            Speed
}

type Speed struct {
	SpeedType string
	RoundTime int
}

type BetLimit struct {
	BetType string
	BetCap  float32
}

type Player struct {
	Id            int
	Seat          int
	Name          string
	Display       string
	StartingStack float32
}

type Round struct {
	Id      int
	Street  string
	Cards   []string
	Actions []Action
}
type Action struct {
	ActionNumber int
	PlayerId     int
	Action       string
	IsAllin      bool
	Cards        []string
}

type Pot struct {
	Number     int
	Amount     float32
	Rake       float32
	Jackpot    float32
	PlayerWins []PlayerWin
}

type PlayerWin struct {
	PlayerId        int
	WinAmount       float32
	CashoutAmount   float32
	CashoutFee      float32
	BonusAmount     float32
	ContributedRake float32
}
