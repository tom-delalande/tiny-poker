import type { PokerState } from "./model";
import {
  playerCall,
  playerCheck,
  playerFold,
  playerRaise,
} from "./player-actions";

export function performEnemyActions(
  seat: number,
  pokerState: PokerState
): PokerState {
  if (pokerState.seats[pokerState.currentAction.seatInTurn].isCurrentPlayer)
    return pokerState;

  const seed = Math.random();
  let mustRespondToRaise = pokerState.currentAction.minRaise > 0;

  // If no raise is currently active, 1/2 chance to Raise / Check
  if (!mustRespondToRaise) {
    if (seed < 0.5 || pokerState.seats[seat].stack === 0) {
      return playerCheck(seat, pokerState);
    } else {
      const amount = Math.min(
        pokerState.seats[seat].stack,
        pokerState.currentAction.minRaise + Math.floor((Math.random() * 10) % 4) + 1
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
