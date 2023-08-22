import { logEvent } from "../../analytics/analytics";
import {
  rateHand,
  calculateHands,
  calculateHandScore,
  ScoredHands,
} from "../best-hand-calculator";
import { Card, HandStrength } from "../model";

export function rankPostFlopHand(
  street: "Flop" | "River" | "Turn",
  cards: Card[],
  looseness: number,
  visibleCards: number
): number {
  if ((street = "Turn")) {
    return rateHand(cards).score;
  }
  const cardScore = [undefined, 14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

  const sortedCards = cards
    .map((card) => {
      return {
        value: cardScore[card.value],
        suit: card.suit,
      };
    })
    .sort((cardA, cardB) => cardB.value - cardA.value);
  const scoredHands = calculateHands(cards);

  const handScores = mapScoredHandsToHandScores(
    scoredHands,
    sortedCards.map((it) => it.value)
  );

  const hands = handScores.map((score) =>
    calculateHandScore(score.handStrength, score.highCards, score.cards)
  );
  const almostHands = handScores.map((score) =>
    calculateAlmostHandScore(
      score.handStrength,
      street,
      visibleCards,
      score.highCards[0],
      score.cards,
      looseness
    )
  );
  const allScored = [...hands, ...almostHands];
  const handRating = Math.max(...allScored);
  logEvent("ai-hand-ranking-calculated", {
    street,
    cards,
    looseness,
    foundHands: scoredHands,
    handRating,
  });
  return handRating;
}

function mapScoredHandsToHandScores(
  hands: ScoredHands,
  cards: number[]
): HandScore[] {
  return Object.keys(hands).flatMap((hand: string) => {
    return hands[hand].map((cardValue: any) => {
      const handStrength = handStrengthKeyToString[hand];
      let highCards = [cardValue];
      if (handStrength == "Full House") {
        highCards = [cardValue.threeOfAKind, cardValue.pair];
      }
      return {
        handStrength,
        highCards: highCards,
        cards,
      };
    });
  });
}

type AlmostHandStrength =
  | "Open Ended Straight Draw"
  | "Inside Straight"
  | "Four Flush";

const handStrengthKeyToString: {
  [key: string]: HandStrength | AlmostHandStrength;
} = {
  highCard: "High Card",
  pair: "Pair",
  threeOfAKind: "Three of a Kind",
  fullHouse: "Full House",
  flush: "Flush",
  fourOfAKind: "Four of a Kind",
  straight: "Straight",
  straightFlush: "Straight Flush",

  openEndedStraightDraw: "Open Ended Straight Draw",
  insideStraight: "Inside Straight",
  fourFlush: "Four Flush",
};

interface HandScore {
  handStrength: HandStrength;
  highCards: number[];
  cards: number[];
}

type Street = "Flop" | "River" | "Turn";

function calculateAlmostHandScore(
  handStrength: string,
  street: Street,
  visibleCards: number,
  currentHighCard: number,
  cards: number[],
  looseness: number
): number {
  const almostProbability = almostProbabilities[handStrength];
  const targetHand = almostProbability.target;

  const bestScore = calculateHandScore(targetHand, [currentHighCard], cards);
  let probability = almostProbability.probability / (52 - visibleCards);
  if (street === "Flop") {
    probability *= 2;
  }
  if (street === "Turn") {
    probability *= 0;
  }

  // If something has a 0.25 chance, even the least loose player should go for
  // it, if something has a 0 chance the loosest player should go for it
  return Math.min(1, 4 * probability * looseness) * bestScore;
}

interface AlmostProbability {
  probability: number;
  target: HandStrength;
}
const almostProbabilities: { [key: string]: AlmostProbability } = {
  highCard: {
    probability: 5,
    target: "Pair",
  },
  pair: {
    probability: 2,
    target: "Three of a Kind",
  },
  fourFlush: {
    probability: 13,
    target: "Flush",
  },
  threeOfAKind: {
    probability: 1,
    target: "Four of a Kind",
  },
  insideStraight: {
    probability: 4,
    target: "Straight",
  },
  openEndedStraightDraw: {
    probability: 8,
    target: "Straight",
  },
};
