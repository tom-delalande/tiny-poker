import { createInitalDeck } from "./deck";

export interface Card {
  value: number;
  suit: "Hearts" | "Spades" | "Clubs" | "Diamonds" | "Hidden";
}

export interface Player {
  cards: Card[];
  stack: number;
  out: boolean;
  isCurrentPlayer: boolean;
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

export function createInitalHandState(): PokerState {
  const deck = createInitalDeck();
  const playerCards = [deck.pop(), deck.pop()];
  const enemyCards = [deck.pop(), deck.pop()];
  return {
    seats: [
      {
        cards: playerCards,
        stack: 20,
        out: false,
        isCurrentPlayer: true,
      },
      {
        cards: enemyCards,
        stack: 20,
        out: false,
        isCurrentPlayer: false,
      },
    ],
    round: "Blinds",
    currentAction: {
      seatInTurn: 0,
      minRaise: 0,
      lastSeatToRaise: -1,
    },
    communityCards: [
      { value: 0, suit: "Hidden" },
      { value: 0, suit: "Hidden" },
      { value: 0, suit: "Hidden" },
      { value: 0, suit: "Hidden" },
      { value: 0, suit: "Hidden" },
    ],
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
    pokerState.seats[seat].out = true;
    return finishTurn(pokerState);
  }

  // Call
  if (mustCall && seed < 0.6) {
    pokerState.seats[seat].stack -= pokerState.currentAction.minRaise;
    pokerState.pot += pokerState.currentAction.minRaise;
    return finishTurn(pokerState);
  }

  // Check
  if (!mustCall && seed < 0.5) {
    return finishTurn(pokerState);
  }

  // Raise
  const raiseAmount = Math.floor(seed * 10);
  pokerState.seats[seat].stack -=
    pokerState.currentAction.minRaise + raiseAmount;
  pokerState.pot += pokerState.currentAction.minRaise + raiseAmount;
  pokerState.currentAction.minRaise += raiseAmount;
  return finishTurn(pokerState);
}

function finishTurn(pokerState: PokerState): PokerState {
  if (pokerState.seats.filter((it) => !it.out).length === 1) {
    pokerState.finished = true;
    return;
  }

  let seatInTurn = pokerState.currentAction.seatInTurn;
  seatInTurn = (seatInTurn + 1) % pokerState.seats.length;
  while (pokerState.seats[seatInTurn].out === false) {
    seatInTurn = (seatInTurn + 1) % pokerState.seats.length;
  }
  if (seatInTurn === pokerState.currentAction.lastSeatToRaise) {
    pokerState.currentAction = {
      seatInTurn: 0,
      minRaise: 0,
      lastSeatToRaise: -1,
    };
    if (pokerState.round === "Blinds") {
      pokerState.round = "Flop";
    }
    if (pokerState.round === "Flop") {
      pokerState.round = "River";
    }
    if (pokerState.round === "River") {
      pokerState.round = "Turn";
    }
    if (pokerState.round === "Turn") {
      pokerState.finished = true;
    }
  }
  pokerState.currentAction.seatInTurn = seatInTurn;

  return pokerState;
}

export function playerCheck(_: number, pokerState: PokerState): PokerState {
  if (pokerState.currentAction.minRaise > 0) return pokerState;
  return finishTurn(pokerState);
}

export function playerFold(seat: number, pokerState: PokerState): PokerState {
  pokerState.seats[seat].out = true;
  return finishTurn(pokerState);
}

export function playerCall(seat: number, pokerState: PokerState): PokerState {
  pokerState.seats[seat].stack -= pokerState.currentAction.minRaise;
  pokerState.pot += pokerState.currentAction.minRaise;
  return finishTurn(pokerState);
}

export function playerRaise(seat: number, pokerState: PokerState): PokerState {
  const seed = Math.random();
  const raiseAmount = Math.floor(seed * 10);
  pokerState.seats[seat].stack -=
    pokerState.currentAction.minRaise + raiseAmount;
  pokerState.pot += pokerState.currentAction.minRaise + raiseAmount;
  pokerState.currentAction.minRaise += raiseAmount;
  return finishTurn(pokerState);
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
  communityCards[3] = pokerState.communityCards[3];
  if (pokerState.round === "Flop") return communityCards;

  communityCards[4] = pokerState.communityCards[4];
  if (pokerState.round === "River") return communityCards;

  communityCards[5] = pokerState.communityCards[5];
  return communityCards;
}
