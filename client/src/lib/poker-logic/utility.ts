import type { Card, HandState } from "./model";

export function calculateShownCommunityCards(pokerState: HandState): Card[] {
  const communityCards: Card[] = [
    { value: -1, suit: "Hidden" },
    { value: -1, suit: "Hidden" },
    { value: -1, suit: "Hidden" },
    { value: -1, suit: "Hidden" },
    { value: -1, suit: "Hidden" },
  ];

  if (pokerState.round === "Blinds" && !pokerState.finished)
    return communityCards;

  communityCards[0] = pokerState.communityCards[0];
  communityCards[1] = pokerState.communityCards[1];
  communityCards[2] = pokerState.communityCards[2];
  if (pokerState.round === "Flop" && !pokerState.finished)
    return communityCards;

  communityCards[3] = pokerState.communityCards[3];
  if (pokerState.round === "River" && !pokerState.finished)
    return communityCards;

  communityCards[4] = pokerState.communityCards[4];
  return communityCards;
}
