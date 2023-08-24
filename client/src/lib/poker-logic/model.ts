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
  version: number; // Protocol version to check for breaking changes
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

export interface Bots {
  tim: BotState;
  emma: BotState;
}

export interface GameState {
  version: number; // Protocol version to check for breaking changes
  bots: Bots;
}

export interface BotState {
  botId: string;
  unlocked: boolean;
  currentGems: number;
  maxGems: number;
}

export interface BotInformation {
  id: string;
  name: string;
  description: string;
  tips: string[];
  looseness: number;
  aggression: number;
  maxGems: number;
  avatar: string;
}
