import type { Card, HandRating, HandStrength } from "./model";

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

export interface ScoredHands {
  highCard: number[];
  pair: number[];
  threeOfAKind: number[];
  fullHouse: { threeOfAKind: number; pair: number }[];
  flush: number[];
  fourOfAKind: number[];
  straight: number[];
  straightFlush: number[];

  openEndedStraightDraw: number[];
  insideStraight: number[];
  fourFlush: number[];
}

export function calculateHands(cards: Card[]): ScoredHands {
  const cardScore = [undefined, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  const sortedCards = cards
    .map((card) => {
      return {
        value: cardScore[card.value],
        suit: card.suit,
      };
    })
    .sort((cardA, cardB) => cardB.value - cardA.value);
  const valueFrequency = toValueFrequency(sortedCards);
  const suitFrequency = toSuitsFrequency(sortedCards);

  const highCard = sortedCards.map((it) => it.value);
  const pairCombinations = calculatePairCombinations(valueFrequency);
  const flush = calculateFlushes(suitFrequency, sortedCards);
  const straight = calculateStraights(valueFrequency);
  const straightFlush = calculateStraightFlushes(straight, flush);
  const fourFlush = calculateFourFlush(suitFrequency, sortedCards);
  const openEndedStraightDraw = calculateOpenEndedStraightDraw(valueFrequency);
  const insideStraight = calculateInsideStraight(valueFrequency);

  return {
    highCard,
    pair: pairCombinations.pair,
    threeOfAKind: pairCombinations.threeOfAKind,
    fullHouse: pairCombinations.fullHouse,
    flush,
    fourOfAKind: pairCombinations.fourOfAKind,
    straight,
    straightFlush,
    openEndedStraightDraw,
    insideStraight,
    fourFlush,
  };
}

interface PairCombinations {
  pair: number[];
  threeOfAKind: number[];
  fourOfAKind: number[];
  fullHouse: { threeOfAKind: number; pair: number }[];
}

function calculatePairCombinations(valueFrequency: {
  [key: string]: number;
}): PairCombinations {
  const pair = [];
  const threeOfAKind = [];
  const fourOfAKind = [];
  const fullHouse = [];
  Object.keys(valueFrequency).forEach((key) => {
    if (pair.length > 0 && valueFrequency[key] >= 3) {
      fullHouse.push({ threeOfAKind: parseInt(key), pair: parseInt(pair[0]) });
    }
    if (threeOfAKind.length > 0 && valueFrequency[key] >= 2) {
      fullHouse.push({
        threeOfAKind: parseInt(threeOfAKind[0]),
        pair: parseInt(key),
      });
    }

    if (valueFrequency[key] >= 2) {
      pair.push(parseInt(key));
    }
    if (valueFrequency[key] >= 3) {
      threeOfAKind.push(parseInt(key));
    }
    if (valueFrequency[key] >= 4) {
      fourOfAKind.push(parseInt(key));
    }
  });

  return {
    pair,
    threeOfAKind,
    fourOfAKind,
    fullHouse,
  };
}

function calculateFlushes(
  suitFrequency: { [key: string]: number },
  sortedCards: Card[]
): number[] {
  const flush = [];
  const suitFrequencyValues = Object.values(suitFrequency);
  Object.keys(suitFrequency).forEach((key, index) => {
    if (suitFrequencyValues[index] >= 5) {
      const highestCardInFlush = sortedCards.find((card) => card.suit === key);
      flush.push(highestCardInFlush.value);
    }
  });
  return flush;
}

function calculateFourFlush(
  suitFrequency: { [key: string]: number },
  sortedCards: Card[]
): number[] {
  const flush = [];
  const suitFrequencyValues = Object.values(suitFrequency);
  Object.keys(suitFrequency).forEach((key, index) => {
    if (suitFrequencyValues[index] >= 4) {
      const highestCardInFlush = sortedCards.find((card) => card.suit === key);
      flush.push(highestCardInFlush.value);
    }
  });
  return flush;
}

function calculateStraightFlushes(straight: number[], flush: number[]) {
  const straightFlushes = [];
  straight.forEach((value) => {
    if (flush.includes(value)) {
      straightFlushes.push(value);
    }
  });
  return straightFlushes;
}

function calculateStraights(valueFrequency: { [key: string]: number }) {
  const straight = [];
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
      straight.push(key + 4);
    }
  });
  return straight;
}

function calculateOpenEndedStraightDraw(valueFrequency: {
  [key: string]: number;
}) {
  const straight = [];
  let frequencyKeys = Object.keys(valueFrequency).map((it) => parseInt(it));
  if (frequencyKeys.includes(14)) {
    frequencyKeys = [1, ...frequencyKeys];
  }
  frequencyKeys.forEach((key, index) => {
    if (frequencyKeys.length < index + 4) return;

    if (
      frequencyKeys[index + 1] == key + 1 &&
      frequencyKeys[index + 2] == key + 2 &&
      frequencyKeys[index + 3] == key + 3
    ) {
      straight.push(key + 3);
    }
  });
  return straight;
}

function calculateInsideStraight(valueFrequency: { [key: string]: number }) {
  const straight = [];
  let frequencyKeys = Object.keys(valueFrequency).map((it) => parseInt(it));
  if (frequencyKeys.includes(14)) {
    frequencyKeys = [1, ...frequencyKeys];
  }
  frequencyKeys.forEach((key, index) => {
    if (frequencyKeys.length < index + 5) return;

    let missed = false;
    let failed = false;

    for (let add = 1; add < 4; add++) {
      if (frequencyKeys[index + add] != key + add) {
        if (missed) {
          failed = true;
        } else {
          missed = true;
        }
      }
    }

    if (!failed) {
      straight.push(key + 4);
    }
  });
  return straight;
}
export function rateHand(cards: Card[]): HandRating {
  const hands = calculateHands(cards);
  const highCards = hands.highCard;
  const straightFlushes = hands.straightFlush;
  const straights = hands.straight;
  const flushes = hands.flush;
  const pairs = hands.pair;
  const trips = hands.threeOfAKind;
  const quads = hands.fourOfAKind;
  const fullHouses = hands.fullHouse;
  if (straightFlushes.length > 0) {
    const score = calculateHandScore(
      "Straight Flush",
      [straightFlushes[0]],
      highCards
    );
    return {
      score,
      handStrength: "Straight Flush",
    };
  }
  if (straights.length > 0) {
    const score = calculateHandScore("Straight", [straights[0]], highCards);
    return {
      score,
      handStrength: "Straight",
    };
  }
  if (flushes.length > 0) {
    const score = calculateHandScore("Flush", [flushes[0]], highCards);
    return {
      score,
      handStrength: "Flush",
    };
  }
  if (quads.length > 0) {
    const score = calculateHandScore("Four of a Kind", [quads[0]], highCards);
    return {
      score,
      handStrength: "Four of a Kind",
    };
  }
  if (fullHouses.length > 0) {
    const score = calculateHandScore(
      "Full House",
      [fullHouses[0].threeOfAKind, fullHouses[0].pair],
      highCards
    );
    return {
      score,
      handStrength: "Full House",
    };
  }
  if (trips.length > 0) {
    const score = calculateHandScore("Three of a Kind", [trips[0]], highCards);
    return {
      score,
      handStrength: "Three of a Kind",
    };
  }
  if (pairs.length > 1) {
    const score = calculateHandScore(
      "Two Pair",
      [pairs[0], pairs[1]],
      highCards
    );
    return {
      score,
      handStrength: "Two Pair",
    };
  }
  if (pairs.length > 0) {
    const score = calculateHandScore("Pair", [pairs[0]], highCards);
    return {
      score,
      handStrength: "Pair",
    };
  }
  const score = calculateHandScore("High Card", [highCards[0]], highCards);
  return {
    score,
    handStrength: "High Card",
  };
}

export function calculateHandScore(
  handStrength: HandStrength,
  highCard: number[],
  sortedCards: number[]
) {
  highCard.forEach((card) => {
    const highCardIndex = sortedCards.findIndex((it) => it == card);
    if (highCardIndex >= 0) {
      sortedCards.splice(highCardIndex, 1);
    }
    if (sortedCards.length === 0) {
      sortedCards.push(0);
    }
  });

  if (handStrength == "High Card") {
    return (
      0.007 * highCard[0] ||
      0 + 0.00007 * sortedCards[0] ||
      0 + 0.0000007 * sortedCards[1] ||
      0 + 0.000000007 * sortedCards[2] ||
      0 + 0.00000000007 * sortedCards[3] ||
      0
    );
  }

  if (handStrength == "Pair") {
    return (
      0.2 + 0.007 * highCard[0] ||
      0 + 0.00007 * sortedCards[0] ||
      0 + 0.0000007 * sortedCards[1] ||
      0 + 0.000000007 * sortedCards[2] ||
      0
    );
  }

  if (handStrength == "Two Pair") {
    return (
      0.3 + 0.007 * highCard[0] ||
      0 + 0.00007 * highCard[1] ||
      0 + 0.0000007 * sortedCards[0] ||
      0
    );
  }

  if (handStrength == "Three of a Kind") {
    return (
      0.4 + 0.007 * highCard[0] ||
      0 + 0.00007 * sortedCards[0] ||
      0 + 0.0000007 * sortedCards[1] ||
      0
    );
  }

  if (handStrength == "Straight") {
    return 0.5 + 0.007 * highCard[0] || 0;
  }
  if (handStrength == "Flush") {
    return 0.6 + 0.007 * highCard[0] || 0;
  }

  if (handStrength == "Full House") {
    return 0.7 + 0.007 * highCard[0] || 0 + 0.00007 * highCard[1] || 0;
  }

  if (handStrength == "Four of a Kind") {
    // I think the cards might need to be removed from the sorted cards
    return 0.8 + 0.007 * highCard[0] || 0 + 0.00007 * sortedCards[0] || 0;
  }

  if (handStrength == "Straight Flush") {
    return 0.9 + 0.007 * highCard[0] || 0;
  }
}
