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

  const sortedCards = cards.sort(
    (cardA, cardB) => cardScore[cardB.value] - cardScore[cardA.value]
  );
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
    removeHighcards(straightFlushes[0], highCards);
    return {
      score: 8_000_000 + 4500 * straightFlushes[0],
      handStrength: "Straight Flush",
    };
  }
  if (straights.length > 0) {
    removeHighcards(straights[0], highCards);
    return { score: 7_000_000 + 4500 * straights[0], handStrength: "Straight" };
  }
  if (flushes.length > 0) {
    removeHighcards(flushes[0], highCards);
    return { score: 6_000_000 + 4500 * flushes[0], handStrength: "Flush" };
  }
  if (quads.length > 0) {
    removeHighcards(quads[0], highCards);
    return {
      score: 5_000_000 + 4500 * quads[0] + 300 * highCards[0],
      handStrength: "Four of a Kind",
    };
  }
  if (fullHouses.length > 0) {
    removeHighcards(fullHouses[0].trips, highCards);
    removeHighcards(fullHouses[0].pairs, highCards);
    return {
      score: 4_000_000 + 4500 * fullHouses[0].trips + 300 * fullHouses[0].pair,
      handStrength: "Full House",
    };
  }
  if (trips.length > 0) {
    removeHighcards(trips[0], highCards);
    return {
      score:
        3_000_000 + 4500 * trips[0] + 300 * highCards[0] + 15 * highCards[1],
      handStrength: "Three of a Kind",
    };
  }
  if (pairs.length > 1) {
    removeHighcards(pairs[0], highCards);
    removeHighcards(pairs[1], highCards);
    return {
      score: 2_000_000 + 4500 * pairs[0] + 300 * pairs[1] + 15 * highCards[0],
      handStrength: "Two Pair",
    };
  }
  if (pairs.length > 0) {
    removeHighcards(pairs[0], highCards);
    return {
      score:
        1_000_000 +
        4500 * pairs[0] +
        300 * highCards[0] +
        15 * highCards[1] +
        1 * highCards[2],
      handStrength: "Pair",
    };
  }
  return {
    score:
      70000 * highCards[0] +
      4500 * highCards[1] +
      300 * highCards[2] +
      15 * highCards[3] +
      1 * highCards[4],
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
