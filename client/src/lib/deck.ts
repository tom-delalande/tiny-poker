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

  return deck.sort(() => Math.random() - 0.5);
}
