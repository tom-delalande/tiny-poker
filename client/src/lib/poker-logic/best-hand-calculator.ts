import type { Card } from "./model";

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
