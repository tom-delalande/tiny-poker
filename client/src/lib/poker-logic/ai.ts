import { logEvent } from "../analytics/analytics";
import { rankPostFlopHand } from "./ai/hand-ranking";
import { getStartingHandToRanking } from "./ai/starting-hand-rankings";
import type { HandState } from "./model";
import {
  playerCall,
  playerCheck,
  playerFold,
  playerRaise,
} from "./player-actions";

export function performEnemyActions_v2(
  seat: number,
  pokerState: HandState,
  aggression: number, // 0 -> 1 how likely the player is to raise
  looseness: number // 0 -> 1 how likely the player is to play a hand
) {
  const player = pokerState.seats[seat];
  const cards = player.cards;
  let handRating = 0;
  if (pokerState.round === "Blinds") {
    handRating = getStartingHandToRanking(cards);
  } else {
    handRating = rankPostFlopHand(
      pokerState.round,
      cards,
      looseness,
      cards.length
    );
  }

  return calculateActions(seat, pokerState, aggression, looseness, handRating);
}

function calculateActions(
  seat: number,
  pokerState: HandState,
  aggression: number, // 0 -> 1 how likely the player is to raise
  looseness: number, // 0 -> 1 how likely the player is to play a hand
  handRating: number
) {
  const player = pokerState.seats[seat];
  const startingHand = player.cards;
  const actions = calculateAcceptedActions(
    handRating,
    looseness,
    aggression,
    pokerState.pot
  );
  const currentAction = pokerState.currentAction;
  const effectiveCurrentMinRaise = currentAction.minRaise - player.currentRaise;
  logEvent("ai-action-calculated", {
    round: pokerState.round,
    looseness,
    aggression,
    handRating,
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

function calculateAcceptedActions(
  handRating: number,
  looseness: number,
  aggression: number,
  pot: number
): BotAction {
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
