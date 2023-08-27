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
    player.stack,
    pokerState.blinds.bigBlind
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

export function calculateAcceptedActions(
  handRating: number,
  looseness: number,
  aggression: number,
  currentStack: number,
  bigBlind: number
): BotAction {
  // the looseness/aggression v curve follows a
  // y = x^(tan((v * pi) / 2))
  // tan((v * pi) / 2) maps a number between 0 and 1 to be between 0 and
  // infinity, where 0.5 is 1
  //
  // This left me use it as the power of the hand-rating to get a curve
  // between, 0 and current stack.
  //
  // Current stack is multiplied so that we go all in on hands
  // worse than best, hand, we also add big blinds as a backup.
  //
  // TODO: this seems to curve too early even with relativly small values (look
  // at tests)
  const effectiveStack = Math.max(currentStack * 1.2, 3 * bigBlind);
  const effectiveLooseness = Math.pow(
    handRating,
    Math.tan(((1 - looseness) * Math.PI) / 2)
  );
  const effectiveAggression = Math.pow(
    handRating,
    Math.tan(((1 - aggression) * Math.PI) / 2)
  );
  const maxCall = Math.floor(effectiveLooseness * effectiveStack);
  const minRaise = Math.floor(maxCall * effectiveAggression);
  return {
    minRaise,
    maxCall,
  };
}

export interface BotAction {
  minRaise: number;
  maxCall: number;
}
