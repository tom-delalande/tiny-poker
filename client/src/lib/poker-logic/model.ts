export interface InitialPlayer {
  isCurrentPlayer: boolean;
  stack: number;
}

export interface Card {
  value: number;
  suit: "Hearts" | "Spades" | "Clubs" | "Diamonds" | "Hidden";
}

export interface Player {
  cards: Card[];
  stack: number;
  out: boolean;
  isCurrentPlayer: boolean;
  lastAction:
    | "Raise"
    | "Check"
    | "Call"
    | "Fold"
    | "None"
    | "Small Blind"
    | "Big Blind";
  currentRaise: number;
  handStrength?: HandStrength;
}

export interface CurrentAction {
  seatInTurn: number;
  minRaise: number;
  lastSeatToRaise: number;
}

export interface HandState {
  seats: Player[];
  currentAction: CurrentAction;
  round: "Blinds" | "Flop" | "Turn" | "River";
  communityCards: Card[];
  pot: number;
  deck: Card[];
  finished: boolean;
  winners: number[];
}

export type HandStrength =
  | "High Card"
  | "Pair"
  | "Two Pair"
  | "Three of a Kind"
  | "Full House"
  | "Four of a Kind"
  | "Flush"
  | "Straight"
  | "Straight Flush";

export interface HandRating {
  score: number;
  handStrength: HandStrength;
}

export interface GameState {
  currentBotIndex: number;
  currentScore: number;
  targetScore: number;
  characterCardSeen: boolean;
}

export interface EnemyInformation {
  name: string;
  looseness: number;
  aggression: number;
  currentChips: number;
  totalChips: number;
}
