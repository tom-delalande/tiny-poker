import { createInitalDeck } from "./deck";
import { rateHand } from "./best-hand-calculator";
import type { InitialPlayer, Player, PokerState } from "./model";

export function createInitalHandState(
  initialPlayers: InitialPlayer[]
): PokerState {
  const smallBlind = 1;
  const bigBlind = 2;
  const deck = createInitalDeck();
  const seats = initialPlayers.map((player, index): Player => {
    let stack = player.stack;
    let lastAction: "None" | "Raise" = "None";
    let currentRaise = 0;
    if (index === 0) {
      stack -= smallBlind;
      currentRaise = smallBlind;
    }
    if (index === 1) {
      stack -= bigBlind;
      lastAction = "Raise";
      currentRaise = bigBlind;
    }
    return {
      cards: [deck.pop(), deck.pop()],
      stack: stack,
      isCurrentPlayer: player.isCurrentPlayer,
      out: false,
      lastAction: lastAction,
      currentRaise: currentRaise,
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
      minRaise: bigBlind,
      lastSeatToRaise: 1,
    },
    communityCards: communityCards,
    pot: smallBlind + bigBlind,
    deck: deck,
    finished: false,
    winners: [],
  };
}

export function prepareNextHand(pokerState: PokerState): PokerState {
  if (pokerState.seats.filter((it) => it.stack === 0).length === 1) {
    return pokerState;
  }
  const seats: InitialPlayer[] = pokerState.seats.map((seat) => {
    return {
      isCurrentPlayer: seat.isCurrentPlayer,
      stack: seat.stack,
    };
  });

  const lastSeat = seats.pop();
  seats.unshift(lastSeat);

  return createInitalHandState(seats);
}

function handlePayouts(pokerState: PokerState): PokerState {
  const winnings = Math.floor(pokerState.pot / pokerState.winners.length);
  pokerState.winners.forEach((seat) => {
    pokerState.seats[seat].stack += winnings;
  });
  pokerState.pot = 0;
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
      currentRaise: 0,
    };
  });

  const round = pokerState.round;
  if (round === "Blinds") {
    pokerState.round = "Flop";
  }
  if (round === "Flop") {
    pokerState.round = "River";
  }
  if (round === "River") {
    pokerState.round = "Turn";
  }
  const everyoneAllIn = pokerState.seats.every(
    (seat) => seat.out || seat.stack == 0
  );
  if (round === "Turn" || everyoneAllIn) {
    pokerState.seats = pokerState.seats.map((seat) => {
      seat.handStrength = rateHand([
        ...seat.cards,
        ...pokerState.communityCards,
      ]).handStrength;
      return seat;
    });
    pokerState.winners = calculateWinners(pokerState);
    pokerState = handlePayouts(pokerState);
    pokerState.finished = true;
  }
  return pokerState;
}

function calculateWinners(pokerState: PokerState): number[] {
  const handRatings = pokerState.seats.map((seat) => {
    const score = rateHand([...seat.cards, ...pokerState.communityCards]).score;
    console.debug({
      cards: seat.cards,
      score: score,
    });
    return score;
  });

  const winningRating = [...handRatings].sort((a, b) => b - a)[0];
  console.log(winningRating);

  const winners = handRatings
    .map((it, index) => {
      if (it === winningRating) return index;
    })
    .filter((it) => it !== undefined);

  return winners;
}
