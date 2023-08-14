import { rateHand } from "./best-hand-calculator";
import type { Card } from "./model";

describe("straight", () => {
  test("straight starting with ace", () => {
    const cards: Card[] = [
      {
        value: 1,
        suit: "Clubs",
      },
      {
        value: 2,
        suit: "Hearts",
      },
      {
        value: 3,
        suit: "Clubs",
      },
      {
        value: 4,
        suit: "Clubs",
      },
      {
        value: 5,
        suit: "Spades",
      },
      {
        value: 13,
        suit: "Spades",
      },
      {
        value: 12,
        suit: "Spades",
      },
    ];
    const rating = rateHand(cards);
    expect(rating.handStrength).toBe("Straight");
  });

  test("straight finishing with ace", () => {
    const cards: Card[] = [
      {
        value: 11,
        suit: "Hearts",
      },
      {
        value: 10,
        suit: "Clubs",
      },
      {
        value: 4,
        suit: "Clubs",
      },
      {
        value: 5,
        suit: "Spades",
      },
      {
        value: 13,
        suit: "Spades",
      },
      {
        value: 12,
        suit: "Spades",
      },
      {
        value: 1,
        suit: "Clubs",
      },
    ];
    const rating = rateHand(cards);
    expect(rating.handStrength).toBe("Straight");
  });

  test("straight wrapping around fails", () => {
    const cards: Card[] = [
      {
        value: 12,
        suit: "Hearts",
      },
      {
        value: 13,
        suit: "Clubs",
      },
      {
        value: 1,
        suit: "Clubs",
      },
      {
        value: 2,
        suit: "Spades",
      },
      {
        value: 3,
        suit: "Spades",
      },
      {
        value: 12,
        suit: "Spades",
      },
      {
        value: 1,
        suit: "Clubs",
      },
    ];
    const rating = rateHand(cards);
    expect(rating.handStrength).toBe("Two Pair");
  });

  test("straight flush", () => {
    const cards: Card[] = [
      {
        value: 11,
        suit: "Hearts",
      },
      {
        value: 10,
        suit: "Hearts",
      },
      {
        value: 4,
        suit: "Hearts",
      },
      {
        value: 5,
        suit: "Hearts",
      },
      {
        value: 13,
        suit: "Hearts",
      },
      {
        value: 12,
        suit: "Hearts",
      },
      {
        value: 1,
        suit: "Hearts",
      },
    ];
    const rating = rateHand(cards);
    expect(rating.handStrength).toBe("Straight Flush");
  });
});
