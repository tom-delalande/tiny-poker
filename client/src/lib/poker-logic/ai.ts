import { cardNotation, cardScore } from "./ai/common";
import type { Card, PokerState } from "./model";
import {
  playerCall,
  playerCheck,
  playerFold,
  playerRaise,
} from "./player-actions";

export function performEnemyActions(
  seat: number,
  pokerState: PokerState
): PokerState {
  const seed = Math.random();
  let mustRespondToRaise =
    pokerState.currentAction.minRaise > pokerState.seats[seat].currentRaise;

  // If no raise is currently active, 1/2 chance to Raise / Check
  if (!mustRespondToRaise) {
    if (seed < 0.5 || pokerState.seats[seat].stack === 0) {
      return playerCheck(seat, pokerState);
    } else {
      const amount = Math.min(
        pokerState.seats[seat].stack,
        pokerState.currentAction.minRaise +
          Math.floor((Math.random() * 10) % 4) +
          1
      );
      return playerRaise(seat, pokerState, amount);
    }
  }

  // If a raise is active, 50% - 15% - 35% chance to Call - Raise - Fold
  if (seed < 0.5) {
    return playerCall(seat, pokerState);
  }

  if (seed < 0.65 || pokerState.seats[seat].stack === 0) {
    return playerFold(seat, pokerState);
  }
  const amount = Math.min(
    pokerState.seats[seat].stack,
    pokerState.currentAction.minRaise + Math.floor(seed * 5)
  );
  return playerRaise(seat, pokerState, amount);
}

export function performEnemyActions_v2(
  seat: number,
  pokerState: PokerState,
  aggression: number, // 0 -> 1 how likely the player is to raise
  looseness: number // 0 -> 1 how likely the player is to play a hand
) {
  if (pokerState.round === "Blinds") {
    return performPreflopActions(seat, pokerState, aggression, looseness);
  }

  return performEnemyActions(seat, pokerState);
}

function performPreflopActions(
  seat: number,
  pokerState: PokerState,
  aggression: number, // 0 -> 1 how likely the player is to raise
  looseness: number // 0 -> 1 how likely the player is to play a hand
) {
  const player = pokerState.seats[seat];
  const startingHand = player.cards;
  const actions = calculateStartingHandAcceptedActions(
    startingHand,
    looseness,
    aggression,
    pokerState.pot
  );

  const currentAction = pokerState.currentAction;
  const effectiveCurrentMinRaise = currentAction.minRaise - player.currentRaise;
  console.debug({
    message: "Performing pre-flop actions for AI",
    tags: ["ai"],
    looseness,
    aggression,
    minRaise: actions.minRaise,
    maxCall: actions.maxCall,
    cards: startingHand,
    currentMinRaise: pokerState.currentAction.minRaise,
    effectiveCurrentMinRaise,
  });
  if (effectiveCurrentMinRaise > actions.maxCall) {
    return playerFold(seat, pokerState);
  }
  if (effectiveCurrentMinRaise < actions.minRaise) {
    return playerRaise(seat, pokerState, actions.minRaise);
  }
  if (effectiveCurrentMinRaise > 0) {
    return playerCall(seat, pokerState);
  }
  return playerCheck(seat, pokerState);
}

function calculateStartingHandAcceptedActions(
  pocketCards: Card[],
  looseness: number,
  aggression: number,
  pot: number
): BotAction {
  const notation = convertCardToStartingHandNotation(
    pocketCards[0],
    pocketCards[1]
  );

  const handRating = 1 - startinHandProbabilities[notation] / 100;
  console.debug({
    message: "Converting pocket cards to expected value",
    tags: ["ai"],
    cards: pocketCards,
    notation,
    handRating,
  });
  const maxCall = Math.floor(((handRating + looseness) / 2) * pot * 2);
  const minRaise = Math.floor(maxCall * aggression);
  return {
    minRaise,
    maxCall,
  };
}

interface BotAction {
  minRaise: number;
  maxCall: number;
}

function convertCardToStartingHandNotation(card1: Card, card2: Card): string {
  let highCard = cardNotation[card1.value];
  let lowCard = cardNotation[card2.value];

  if (cardScore[card1.value] < cardScore[card2.value]) {
    highCard = cardNotation[card2.value];
    lowCard = cardNotation[card1.value];
  }
  const suit = card1.suit === card2.suit ? "s" : "o";
  return highCard.toString() + lowCard.toString() + suit;
}

const startinHandProbabilities = {
  AAo: 0,
  AKs: 2,
  AQs: 2,
  AJs: 3,
  ATs: 5,
  A9s: 8,
  A8s: 10,
  A7s: 13,
  A6s: 14,
  A5s: 12,
  A4s: 14,
  A3s: 14,
  A2s: 17,

  AKo: 5,
  KKo: 1,
  KQs: 3,
  KJs: 3,
  KTs: 6,
  K9s: 10,
  K8s: 16,
  K7s: 19,
  K6s: 24,
  K5s: 25,
  K4s: 25,
  K3s: 26,
  K2s: 26,

  AQo: 8,
  KQo: 9,
  QQo: 1,
  QJs: 5,
  QTs: 6,
  Q9s: 10,
  Q8s: 19,
  Q7s: 26,
  Q6s: 28,
  Q5s: 29,
  Q4s: 29,
  Q3s: 30,
  Q2s: 31,

  AJo: 12,
  KJo: 14,
  QJo: 15,
  JJo: 2,
  JTs: 6,
  J9s: 11,
  J8s: 17,
  J7s: 27,
  J6s: 33,
  J5s: 35,
  J4s: 37,
  J3s: 37,
  J2s: 38,

  ATo: 18,
  KTo: 20,
  QTo: 22,
  JTo: 21,
  TTo: 4,
  T9s: 10,
  T8s: 16,
  T7s: 25,
  T6s: 31,
  T5s: 40,
  T4s: 40,
  T3s: 41,
  T2s: 41,

  A9o: 32,
  K9o: 35,
  Q9o: 36,
  J9o: 34,
  T9o: 10,
  "99o": 7,
  "98s": 17,
  "97s": 24,
  "96s": 29,
  "95s": 38,
  "94s": 47,
  "93s": 47,
  "92s": 49,

  A8o: 39,
  K8o: 50,
  Q8o: 53,
  J8o: 48,
  T8o: 43,
  "98o": 42,
  "88o": 9,
  "87s": 21,
  "86s": 27,
  "85s": 33,
  "84s": 40,
  "83s": 53,
  "82s": 54,

  A7o: 45,
  K7o: 57,
  Q7o: 66,
  J7o: 64,
  T7o: 59,
  "97o": 55,
  "87o": 52,
  "77o": 12,
  "76s": 25,
  "75s": 28,
  "74s": 37,
  "73s": 45,
  "72s": 56,

  A6o: 51,
  K6o: 60,
  Q6o: 71,
  J6o: 80,
  T6o: 74,
  "96o": 68,
  "86o": 61,
  "76o": 57,
  "66o": 16,
  "65s": 27,
  "64s": 29,
  "63s": 38,
  "62s": 49,

  A5o: 44,
  K5o: 65,
  Q5o: 75,
  J5o: 82,
  T5o: 89,
  "95o": 83,
  "85o": 73,
  "75o": 65,
  "65o": 58,
  "55o": 20,
  "54s": 28,
  "53s": 32,
  "52s": 39,

  A4o: 46,
  K4o: 67,
  Q4o: 76,
  J4o: 85,
  T4o: 90,
  "94o": 95,
  "84o": 88,
  "74o": 78,
  "64o": 70,
  "54o": 62,
  "44o": 23,
  "43s": 36,
  "42s": 41,

  A3o: 49,
  K3o: 67,
  Q3o: 77,
  J3o: 86,
  T3o: 92,
  "93o": 96,
  "83o": 98,
  "73o": 93,
  "63o": 81,
  "53o": 72,
  "43o": 76,
  "33o": 23,
  "32s": 46,

  A2o: 54,
  K2o: 69,
  Q2o: 79,
  J2o: 87,
  T2o: 94,
  "92o": 97,
  "82o": 99,
  "72o": 100,
  "62o": 95,
  "52o": 84,
  "42o": 86,
  "23o": 91,
  "22o": 24,
};
