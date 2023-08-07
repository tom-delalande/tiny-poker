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
  winners: number[];
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
    winners: [],
  };
}

export function prepareNextHand(pokerState: PokerState): PokerState | Player {
  const lastSeat = pokerState.seats.pop();
  pokerState.seats.push(lastSeat);

  if (pokerState.seats.filter((it) => it.stack === 0).length === 1) {
    return pokerState.seats[
      pokerState.seats.findIndex((seat) => seat.stack > 0)
    ];
  }
  const seats: InitialPlayer[] = pokerState.seats.map((seat) => {
    return {
      isCurrentPlayer: seat.isCurrentPlayer,
      stack: seat.stack,
    };
  });
  return createInitalHandState(seats);
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

export function handlePayouts(pokerState: PokerState): PokerState {
  const winnings = Math.floor(pokerState.pot / pokerState.winners.length);
  pokerState.winners.forEach((seat) => {
    pokerState.seats[seat].stack += winnings;
  });
  return pokerState;
}

export function finishTurn(pokerState: PokerState): PokerState {
  const playersIn = pokerState.seats.filter((it) => !it.out);
  if (playersIn.length === 1) {
    pokerState.winners = [pokerState.seats.findIndex((it) => !it.out)];
    pokerState = handlePayouts(pokerState);
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
  } if (pokerState.round === "Flop") {
    pokerState.round = "River";
  } else if (pokerState.round === "River") {
    pokerState.round = "Turn";
  } else if (pokerState.round === "Turn") {
    pokerState.winners = calculateWinners(pokerState);
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

function calculateWinners(pokerState: PokerState): number[] {
  const handRatings = pokerState.seats.map((seat) => {
    return rateHand([...seat.cards, ...pokerState.communityCards]);
  });

  const winningRating = handRatings.sort((a, b) => b - a)[0];

  const winners = handRatings
    .map((it, index) => {
      if (it === winningRating) return index;
    })
    .filter((it) => it !== undefined);

  return winners;
}

function toValueFrequency(cards: Card[]): { [key: number]: number } {
  const map = {};
  cards.forEach((card) => {
    if (map[card.value]) {
      map[card.value]++;
    } else {
      map[card.value] = 1;
    }
  });
  return map;
}

function toSuitsFrequency(cards: Card[]): { [key: string]: number } {
  const map = {};
  cards.forEach((card) => {
    if (map[card.suit]) {
      map[card.suit]++;
    } else {
      map[card.suit] = 1;
    }
  });
  return map;
}

export function rateHand(cards: Card[]): number {
  const pairs = [];
  const trips = [];
  const fullHouses = [];
  const flushes = [];
  const quads = [];
  const straights = [];
  const straightFlushes = [];

  const cardScore = [undefined, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  const sortedCards = cards.sort(
    (cardA, cardB) => cardScore[cardB.value] - cardScore[cardA.value]
  );
  const highCards = [sortedCards[0].value, sortedCards[1].value];

  const valueFrequency = toValueFrequency(sortedCards);
  const suitFrequency = toSuitsFrequency(sortedCards);

  Object.keys(valueFrequency).forEach((key) => {
    if (pairs.length > 0 && valueFrequency[key] >= 3) {
      fullHouses.push({ trips: key, pair: pairs[0] });
    }
    if (trips.length > 0 && valueFrequency[key] >= 2) {
      fullHouses.push({ trips: trips[0], pair: parseInt(key) });
    }

    if (valueFrequency[key] >= 2) {
      pairs.push(parseInt(key));
    }
    if (valueFrequency[key] >= 3) {
      trips.push(parseInt(key));
    }
    if (valueFrequency[key] >= 4) {
      quads.push(parseInt(key));
    }
  });

  Object.keys(suitFrequency).forEach((key) => {
    if (valueFrequency[key] >= 5) {
      flushes.push(parseInt(key));
    }
  });
  let frequencyKeys = Object.keys(valueFrequency);
  frequencyKeys.forEach((key, index) => {
    if (frequencyKeys.length < index + 4) return;

    if (
      frequencyKeys[index + 1] == key + 1 &&
      frequencyKeys[index + 2] == key + 2 &&
      frequencyKeys[index + 3] == key + 3 &&
      frequencyKeys[index + 4] == key + 4
    ) {
      straights.push(parseInt(key));
    }
  });

  straights.forEach((value) => {
    if (flushes.includes(value)) {
      straightFlushes.push(value);
    }
  });

  if (straightFlushes.length > 0) {
    return 8000 + straightFlushes[0];
  }
  if (straights.length > 0) {
    return 7000 + straights[0];
  }
  if (flushes.length > 0) {
    return 6000 + flushes[0];
  }
  if (quads.length > 0) {
    return 5000 + quads[0];
  }
  if (fullHouses.length > 0) {
    return 4000 + 10 * fullHouses[0].trips + fullHouses[0].pair;
  }
  if (trips.length > 0) {
    return 3000 + trips[0];
  }
  if (pairs.length > 0) {
    return 2000 + pairs[0];
  }
  if (highCards.length > 0) {
    return 1000 + highCards[0];
  }
  return 1;
}
