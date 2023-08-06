import { createInitalDeck } from "./deck";

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
  lastAction: "Raise" | "Check" | "Call" | "Fold" | "None";
}

export interface CurrentAction {
  seatInTurn: number;
  minRaise: number;
  lastSeatToRaise: number;
}

export interface PokerState {
  seats: Player[];
  currentAction: CurrentAction;
  round: "Blinds" | "Flop" | "River" | "Turn";
  communityCards: Card[];
  pot: number;
  deck: Card[];
  finished: boolean;
  winner: number;
}

export function createInitalHandState(
  initialPlayers: InitialPlayer[]
): PokerState {
  const deck = createInitalDeck();
  const seats = initialPlayers.map((player): Player => {
    return {
      cards: [deck.pop(), deck.pop()],
      stack: player.stack,
      isCurrentPlayer: player.isCurrentPlayer,
      out: false,
      lastAction: "None",
    };
  });
  const communityCards = [
    deck.pop(),
    deck.pop(),
    deck.pop(),
    deck.pop(),
    deck.pop(),
  ];
  return {
    seats: seats,
    round: "Blinds",
    currentAction: {
      seatInTurn: 0,
      minRaise: 0,
      lastSeatToRaise: -1,
    },
    communityCards: communityCards,
    pot: 0,
    deck: deck,
    finished: false,
    winner: -1,
  };
}

export function performEnemyActions(
  seat: number,
  pokerState: PokerState
): PokerState {
  if (pokerState.seats[pokerState.currentAction.seatInTurn].isCurrentPlayer)
    return pokerState;
  const seed = Math.random();

  let mustCall = pokerState.currentAction.minRaise > 0;

  // Fold
  if (mustCall && seed < 0.1) {
    pokerState.seats[seat].lastAction = "Fold";
    pokerState.seats[seat].out = true;
    return pokerState;
  }

  // Call
  if (mustCall && seed < 0.6) {
    pokerState.seats[seat].lastAction = "Call";
    pokerState.seats[seat].stack -= pokerState.currentAction.minRaise;
    pokerState.pot += pokerState.currentAction.minRaise;
    return pokerState;
  }

  // Check
  if (!mustCall && seed < 0.5) {
    pokerState.seats[seat].lastAction = "Check";
    return pokerState;
  }

  // Raise
  pokerState.seats[seat].lastAction = "Raise";
  const raiseAmount = Math.floor(seed * 10);
  pokerState.seats[seat].stack -=
    pokerState.currentAction.minRaise + raiseAmount;
  pokerState.pot += pokerState.currentAction.minRaise + raiseAmount;
  pokerState.currentAction.minRaise += raiseAmount;
  pokerState.currentAction.lastSeatToRaise = seat;
  return pokerState;
}

export function finishTurn(pokerState: PokerState): PokerState {
  if (pokerState.seats.filter((it) => !it.out).length === 1) {
    pokerState.finished = true;
    return pokerState;
  }

  let seatInTurn = pokerState.currentAction.seatInTurn;
  seatInTurn = (seatInTurn + 1) % pokerState.seats.length;
  while (pokerState.seats[seatInTurn].out === true) {
    seatInTurn = (seatInTurn + 1) % pokerState.seats.length;
  }
  if (seatInTurn === pokerState.currentAction.lastSeatToRaise) {
    pokerState = finishRound(pokerState);
  }
  pokerState.currentAction.seatInTurn = seatInTurn;

  return pokerState;
}

function finishRound(pokerState: PokerState): PokerState {
  pokerState.currentAction = {
    seatInTurn: 0,
    minRaise: 0,
    lastSeatToRaise: -1,
  };
  pokerState.seats = pokerState.seats.map((seat) => {
    return {
      cards: seat.cards,
      stack: seat.stack,
      out: seat.out,
      isCurrentPlayer: seat.isCurrentPlayer,
      lastAction: "None",
    };
  });
  if (pokerState.round === "Blinds") {
    pokerState.round = "Flop";
  } else if (pokerState.round === "Flop") {
    pokerState.round = "River";
  } else if (pokerState.round === "River") {
    pokerState.round = "Turn";
  } else if (pokerState.round === "Turn") {
    pokerState.finished = true;
  }
  return pokerState;
}

export function playerCheck(seat: number, pokerState: PokerState): PokerState {
  if (pokerState.currentAction.minRaise > 0) return pokerState;
  pokerState.seats[seat].lastAction = "Check";
  pokerState.currentAction.lastSeatToRaise = seat;
  return pokerState;
}

export function playerFold(seat: number, pokerState: PokerState): PokerState {
  pokerState.seats[seat].lastAction = "Fold";
  pokerState.seats[seat].out = true;
  return pokerState;
}

export function playerCall(seat: number, pokerState: PokerState): PokerState {
  pokerState.seats[seat].lastAction = "Call";
  pokerState.seats[seat].stack -= pokerState.currentAction.minRaise;
  pokerState.pot += pokerState.currentAction.minRaise;
  return pokerState;
}

export function playerRaise(
  seat: number,
  pokerState: PokerState,
  raiseAmount: number
): PokerState {
  pokerState.seats[seat].lastAction = "Raise";
  pokerState.seats[seat].stack -=
    pokerState.currentAction.minRaise + raiseAmount;
  pokerState.pot += pokerState.currentAction.minRaise + raiseAmount;
  pokerState.currentAction.minRaise += raiseAmount;
  pokerState.currentAction.lastSeatToRaise = seat;
  return pokerState;
}

export function calculateShownCommunityCards(pokerState: PokerState): Card[] {
  const communityCards: Card[] = [
    { value: -1, suit: "Hidden" },
    { value: -1, suit: "Hidden" },
    { value: -1, suit: "Hidden" },
    { value: -1, suit: "Hidden" },
    { value: -1, suit: "Hidden" },
  ];

  if (pokerState.round === "Blinds") return communityCards;

  communityCards[0] = pokerState.communityCards[0];
  communityCards[1] = pokerState.communityCards[1];
  communityCards[2] = pokerState.communityCards[2];
  if (pokerState.round === "Flop") return communityCards;

  communityCards[3] = pokerState.communityCards[3];
  if (pokerState.round === "River") return communityCards;

  communityCards[4] = pokerState.communityCards[4];
  return communityCards;
}
