import type { Card } from "./poker-logic";

export function createInitalDeck(): Card[] {
  const deck: Card[] = [];
  const suits: ("Hearts" | "Spades" | "Clubs" | "Diamonds")[] = [
    "Hearts",
    "Spades",
    "Clubs",
    "Diamonds",
  ];
  suits.forEach((suit) => {
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].forEach((value) => {
      deck.push({
        suit: suit,
        value: value,
      });
    });
  });

  return shuffle(deck);
}

function shuffle(array: Card[]): Card[] {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
