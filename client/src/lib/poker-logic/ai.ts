import { logEvent } from "../analytics/analytics";
import { cardNotation, cardScore } from "./ai/common";
import { getStartingHandToRanking } from "./ai/starting-hand-rankings";
import type { Card, HandState } from "./model";
import {
  playerCall,
  playerCheck,
  playerFold,
  playerRaise,
} from "./player-actions";

export function performEnemyActions(
  seat: number,
  pokerState: HandState
): HandState {
  const seed = Math.random();
  let mustRespondToRaise =
    pokerState.currentAction.minRaise > pokerState.seats[seat].currentRaise;

  logEvent("ai-action-calculated", {
    mustRespondToRaise,
    seed,
    round: pokerState.round,
  });
  // If no raise is currently active, 1/2 chance to Raise / Check
  if (!mustRespondToRaise) {
    if (seed < 0.5 || pokerState.seats[seat].stack === 0) {
      return playerCheck(seat, pokerState);
    } else {
      const amount = Math.min(
        pokerState.seats[seat].stack,
        pokerState.currentAction.minRaise +
          Math.floor((Math.random() * 10) % 4) +
          1
      );
      return playerRaise(seat, pokerState, amount);
    }
  }

  // If a raise is active, 50% - 15% - 35% chance to Call - Raise - Fold
  if (seed < 0.5) {
    return playerCall(seat, pokerState);
  }

  if (seed < 0.65 || pokerState.seats[seat].stack === 0) {
    return playerFold(seat, pokerState);
  }
  const amount = Math.min(
    pokerState.seats[seat].stack,
    pokerState.currentAction.minRaise + Math.floor(seed * 5)
  );
  return playerRaise(seat, pokerState, amount);
}

export function performEnemyActions_v2(
  seat: number,
  pokerState: HandState,
  aggression: number, // 0 -> 1 how likely the player is to raise
  looseness: number // 0 -> 1 how likely the player is to play a hand
) {
  if (pokerState.round === "Blinds") {
    return performPreflopActions(seat, pokerState, aggression, looseness);
  }

  return performEnemyActions(seat, pokerState);
}

function performPreflopActions(
  seat: number,
  pokerState: HandState,
  aggression: number, // 0 -> 1 how likely the player is to raise
  looseness: number // 0 -> 1 how likely the player is to play a hand
) {
  const player = pokerState.seats[seat];
  const startingHand = player.cards;
  const handRating = getStartingHandToRanking(startingHand);
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
