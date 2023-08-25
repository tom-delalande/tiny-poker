export interface InitialPlayer {
  isCurrentPlayer: boolean;
  botId?: string;
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
  botId?: string;
}

export interface CurrentAction {
  seatInTurn: number;
  minRaise: number;
  lastSeatToRaise: number;
}

export interface HandState {
  version: 4; // Protocol version to check for breaking changes
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
  version: 5; // Protocol version to check for breaking changes
  chips: number;
  gems: number;
}

export interface BotInformation {
  id: string;
  name: string;
  description: string;
  tips: string[];
  looseness: number;
  aggression: number;
  avatar: string;
  buyIn: BuyInOption[];
}

export interface BuyInOption {
  chips: number;
  chipsCost: number;
  gemsCost: number;
}
