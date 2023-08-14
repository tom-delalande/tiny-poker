import { parse } from "svelte/compiler";
import type { Card, HandRating } from "./model";

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

export function rateHand(cards: Card[]): HandRating {
  const pairs = [];
  const trips = [];
  const fullHouses = [];
  const flushes = [];
  const quads = [];
  const straights = [];
  const straightFlushes = [];

  const cardScore = [undefined, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  const sortedCards = cards
    .map((card) => {
      return {
        value: cardScore[card.value],
        suit: card.suit,
      };
    })
    .sort((cardA, cardB) => cardB.value - cardA.value);
  const highCards = sortedCards.map((it) => it.value);
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

  const suitFrequencyValues = Object.values(suitFrequency);
  Object.keys(suitFrequency).forEach((key, index) => {
    if (suitFrequencyValues[index] >= 5) {
      const highestCardInFlush = sortedCards.find((card) => card.suit === key);
      flushes.push(highestCardInFlush.value);
    }
  });
  let frequencyKeys = Object.keys(valueFrequency).map((it) => parseInt(it));
  if (frequencyKeys.includes(14)) {
    frequencyKeys = [1, ...frequencyKeys];
  }
  frequencyKeys.forEach((key, index) => {
    if (frequencyKeys.length < index + 5) return;

    if (
      frequencyKeys[index + 1] == key + 1 &&
      frequencyKeys[index + 2] == key + 2 &&
      frequencyKeys[index + 3] == key + 3 &&
      frequencyKeys[index + 4] == key + 4
    ) {
      straights.push(key + 4);
    }
  });

  console.log({ straights, flushes });
  straights.forEach((value) => {
    if (flushes.includes(value)) {
      straightFlushes.push(value);
    }
  });

  if (straightFlushes.length > 0) {
    removeHighcards(straightFlushes[0], highCards);
    return {
      score: 0.8 + 0.001 * straightFlushes[0],
      handStrength: "Straight Flush",
    };
  }
  if (straights.length > 0) {
    removeHighcards(straights[0], highCards);
    return { score: 0.7 + 0.001 * straights[0], handStrength: "Straight" };
  }
  if (flushes.length > 0) {
    removeHighcards(flushes[0], highCards);
    return { score: 0.6 + 0.001 * flushes[0], handStrength: "Flush" };
  }
  if (quads.length > 0) {
    removeHighcards(quads[0], highCards);
    return {
      score: 0.5 + 0.001 * quads[0] + 0.00001 * highCards[0],
      handStrength: "Four of a Kind",
    };
  }
  if (fullHouses.length > 0) {
    removeHighcards(fullHouses[0].trips, highCards);
    removeHighcards(fullHouses[0].pairs, highCards);
    return {
      score: 0.4 + 0.001 * fullHouses[0].trips + 0.00001 * fullHouses[0].pair,
      handStrength: "Full House",
    };
  }
  if (trips.length > 0) {
    removeHighcards(trips[0], highCards);
    return {
      score:
        0.3 +
        0.001 * trips[0] +
        0.00001 * highCards[0] +
        0.0000001 * highCards[1],
      handStrength: "Three of a Kind",
    };
  }
  if (pairs.length > 1) {
    removeHighcards(pairs[0], highCards);
    removeHighcards(pairs[1], highCards);
    return {
      score:
        0.2 + 0.001 * pairs[0] + 0.00001 * pairs[1] + 0.0000001 * highCards[0],
      handStrength: "Two Pair",
    };
  }
  if (pairs.length > 0) {
    removeHighcards(pairs[0], highCards);
    return {
      score:
        0.1 +
        0.001 * pairs[0] +
        0.00001 * highCards[0] +
        0.0000001 * highCards[1] +
        0.000000001 * highCards[2],
      handStrength: "Pair",
    };
  }
  return {
    score:
      0.001 * highCards[0] +
      0.00001 * highCards[1] +
      0.0000001 * highCards[2] +
      0.000000001 * highCards[3] +
      0.00000000001 * highCards[4],
    handStrength: "High Card",
  };
}

function removeHighcards(card: number, highCards: number[]) {
  const index = highCards.findIndex((it) => it === card);
  if (index > 0) {
    highCards.splice(index, 1);
  }
  if (highCards.length === 0) {
    highCards.push(0);
  }
}
