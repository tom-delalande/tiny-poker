import { logEvent } from "../analytics/analytics";
import type { HandState } from "./model";

export function playerCheck(seat: number, pokerState: HandState): HandState {
  if (isActionIsOutOfTurn(seat, pokerState)) return pokerState;
  if (pokerState.currentAction.minRaise > pokerState.seats[seat].currentRaise)
    return pokerState;

  logEvent("action-performed", {
    action: "check",
    seat,
    pokerState,
  });

  pokerState.seats[seat].lastAction = "Check";
  return pokerState;
}

export function playerFold(seat: number, pokerState: HandState): HandState {
  if (isActionIsOutOfTurn(seat, pokerState)) return pokerState;
  logEvent("action-performed", {
    action: "fold",
    seat,
    pokerState,
  });
  pokerState.seats[seat].lastAction = "Fold";
  pokerState.seats[seat].out = true;
  return pokerState;
}

export function playerCall(seat: number, pokerState: HandState): HandState {
  if (isActionIsOutOfTurn(seat, pokerState)) return pokerState;
  logEvent("action-performed", {
    action: "call",
    seat,
    pokerState,
  });
  pokerState.seats[seat].lastAction = "Call";
  const callAmount = Math.min(
    pokerState.seats[seat].stack,
    pokerState.currentAction.minRaise - pokerState.seats[seat].currentRaise
  );
  pokerState.seats[seat].stack -= callAmount;
  pokerState.pot += callAmount;
  return pokerState;
}

export function playerRaise(
  seat: number,
  pokerState: HandState,
  raiseAmount: number
): HandState {
  if (isActionIsOutOfTurn(seat, pokerState)) return pokerState;
  logEvent("action-performed", {
    action: "raise",
    seat,
    pokerState,
    raiseAmount,
  });
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

function isActionIsOutOfTurn(seat: number, pokerState: HandState): boolean {
  if (pokerState.currentAction.seatInTurn !== seat) {
    console.debug({
      message: "Seat attempted to act out of turn.",
      seat: seat,
      seatInTurn: pokerState.currentAction.seatInTurn,
    });
    return true;
  }
  return false;
}
