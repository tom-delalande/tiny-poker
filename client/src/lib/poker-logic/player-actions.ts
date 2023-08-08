import type { PokerState } from "./model";

export function playerCheck(seat: number, pokerState: PokerState): PokerState {
  if (pokerState.currentAction.minRaise > 0) return pokerState;
  pokerState.seats[seat].lastAction = "Check";
  pokerState.currentAction.lastSeatToRaise = seat;
  return pokerState;
}

export function playerFold(seat: number, pokerState: PokerState): PokerState {
  pokerState.seats[seat].lastAction = "Fold";
  pokerState.seats[seat].out = true;
  return pokerState;
}

export function playerCall(seat: number, pokerState: PokerState): PokerState {
  pokerState.seats[seat].lastAction = "Call";
  const callAmount =
    pokerState.currentAction.minRaise - pokerState.seats[seat].currentRaise;
  pokerState.seats[seat].stack -= callAmount;
  pokerState.pot += callAmount;
  return pokerState;
}

export function playerRaise(
  seat: number,
  pokerState: PokerState,
  raiseAmount: number
): PokerState {
  const player = pokerState.seats[seat];
  pokerState.seats[seat].lastAction = "Raise";
  const totalRaiseAmount = raiseAmount;
  pokerState.seats[seat].stack -= totalRaiseAmount;
  pokerState.pot += raiseAmount;
  pokerState.currentAction.minRaise = raiseAmount + player.currentRaise;
  pokerState.seats[seat].currentRaise = pokerState.currentAction.minRaise;
  pokerState.currentAction.lastSeatToRaise = seat;
  return pokerState;
}
