import { createInitalDeck } from "./deck";
import { rateHand } from "./best-hand-calculator";
import type { InitialPlayer, Player, HandState } from "./model";
import { botGameState, currentBotGameState } from "../ui-logic/state";
import { logEvent } from "../analytics/analytics";

export function createInitalHandState(
  initialPlayers: InitialPlayer[],
  pot: number
): HandState {
  const smallBlind = 1;
  const bigBlind = 2;
  const deck = createInitalDeck();
  const seats = initialPlayers.map((player, index): Player => {
    let stack = player.stack;
    let lastAction: "None" | "Big Blind" | "Small Blind" = "None";
    let currentRaise = 0;
    if (index === 0) {
      stack -= smallBlind;
      currentRaise = smallBlind;
      lastAction = "Small Blind";
    }
    if (index === 1) {
      stack -= bigBlind;
      lastAction = "Big Blind";
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
      seatInTurn: (1 + 1) % seats.length, // Left of big blind
      minRaise: bigBlind,
      lastSeatToRaise: -1,
    },
    communityCards: communityCards,
    pot: pot + smallBlind + bigBlind,
    deck: deck,
    finished: false,
    winners: [],
  };
}

export function prepareNextHand(pokerState: HandState): HandState {
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

  return createInitalHandState(seats, pokerState.pot);
}

function handlePayouts(pokerState: HandState): HandState {
  const winnings = Math.floor(pokerState.pot / pokerState.winners.length);
  const excess = pokerState.pot - winnings * pokerState.winners.length;
  pokerState.winners.forEach((seat) => {
    pokerState.seats[seat].stack += winnings;
  });
  pokerState.pot = excess;
  return pokerState;
}

function finishHand(pokerState: HandState): HandState {
  pokerState = handlePayouts(pokerState);
  pokerState.finished = true;
  const gameFinished =
    pokerState.seats.filter((it) => it.stack === 0).length === 1;
  if (gameFinished) {
    let newRank = Math.max(0, -5);
    if (
      pokerState.winners.filter(
        (winnerseat) => pokerState.seats[winnerseat].isCurrentPlayer
      ).length > 0
    ) {
      newRank = currentBotGameState.currentScore + 5;
    }
    currentBotGameState.currentScore = newRank;
    botGameState.set(currentBotGameState);
  }
  logEvent("hand-finished", {
    gameFinished,
  });
  return pokerState;
}

function finishTurn(pokerState: HandState): HandState {
  console.debug({
    message: "Finishing turn.",
  });
  logEvent("turn-finished");
  const playersIn = pokerState.seats.filter((it) => !it.out);
  if (playersIn.length === 1) {
    pokerState.winners = [pokerState.seats.findIndex((it) => !it.out)];
    return finishHand(pokerState);
  }

  let seatInTurn = pokerState.currentAction.seatInTurn;
  seatInTurn = (seatInTurn + 1) % pokerState.seats.length;
  while (pokerState.seats[seatInTurn].out === true) {
    seatInTurn = (seatInTurn + 1) % pokerState.seats.length;
  }
  if (seatInTurn === pokerState.currentAction.lastSeatToRaise) {
    pokerState = finishRound(pokerState);
  } else if (pokerState.currentAction.lastSeatToRaise === -1) {
    console.debug({
      message: "Updating last seat to raise",
      previous: pokerState.currentAction.lastSeatToRaise,
      new: pokerState.currentAction.seatInTurn,
    });
    pokerState.currentAction.lastSeatToRaise =
      pokerState.currentAction.seatInTurn;
  }
  pokerState.currentAction.seatInTurn = seatInTurn;

  return pokerState;
}

export function finishTurnForPlayer(
  seat: number,
  pokerState: HandState
): HandState {
  if (pokerState.currentAction.seatInTurn !== seat) {
    console.debug({
      message: "Attempted to finish turn for wrong user.",
      seat: seat,
      seatInTurn: pokerState.currentAction.seatInTurn,
    });
    return pokerState;
  }
  return finishTurn(pokerState);
}

function finishRound(pokerState: HandState): HandState {
  console.debug({ message: "Round finished", pokerState });
  logEvent("round-finished");
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
    return finishHand(pokerState);
  }
  return pokerState;
}

function calculateWinners(pokerState: HandState): number[] {
  const handRatings = pokerState.seats.map((seat) => {
    const score = rateHand([...seat.cards, ...pokerState.communityCards]).score;
    console.debug({
      cards: seat.cards,
      score: score,
    });
    return score;
  });

  const winningRating = [...handRatings].sort((a, b) => b - a)[0];

  const winners = handRatings
    .map((it, index) => {
      if (it === winningRating) return index;
    })
    .filter((it) => it !== undefined);

  return winners;
}
