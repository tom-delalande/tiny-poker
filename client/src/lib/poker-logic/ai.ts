import type { PokerState } from "./model";

export function performEnemyActions(
  seat: number,
  pokerState: PokerState
): PokerState {
  if (pokerState.seats[pokerState.currentAction.seatInTurn].isCurrentPlayer)
    return pokerState;
  const seed = Math.random();

  const player = pokerState.seats[seat];
  let mustCall = pokerState.currentAction.minRaise > 0;

  // Fold
  if (mustCall && seed < 0.1) {
    console.debug({
      message: "Opponent Folded",
      seed: seed,
      minRaise: pokerState.currentAction.minRaise,
    });
    pokerState.seats[seat].lastAction = "Fold";
    pokerState.seats[seat].out = true;
    return pokerState;
  }

  // Call
  if (mustCall && seed < 0.6) {
    pokerState.seats[seat].lastAction = "Call";
    const callAmount = Math.min(
      pokerState.seats[seat].stack,
      pokerState.currentAction.minRaise - pokerState.seats[seat].currentRaise
    );
    pokerState.seats[seat].stack -= callAmount;
    pokerState.pot += callAmount;
    console.debug({
      message: "Opponent Called",
      seed: seed,
      minRaise: pokerState.currentAction.minRaise,
      currentRaise: player.currentRaise,
      opponentStack: pokerState.seats[seat].stack,
      callAmount: callAmount,
    });
    return pokerState;
  }

  // Check
  if (!mustCall && seed < 0.5) {
    pokerState.seats[seat].lastAction = "Check";
    console.debug({
      message: "Opponent Checked",
      seed: seed,
      minRaise: pokerState.currentAction.minRaise,
    });
    return pokerState;
  }

  if (
    pokerState.seats[seat].stack <= pokerState.currentAction.minRaise ||
    pokerState.currentAction.lastSeatToRaise === seat
  ) {
    pokerState.seats[seat].lastAction = "Fold";
    pokerState.seats[seat].out = true;
    console.debug({
      message: "Opponent Folded",
      seed: seed,
      opponentStack: pokerState.seats[seat].stack,
      minRaise: pokerState.currentAction.minRaise,
    });
    return pokerState;
  }
  // Raise
  pokerState.seats[seat].lastAction = "Raise";
  const raiseAmount = Math.min(
    pokerState.seats[seat].stack,
    pokerState.currentAction.minRaise + Math.floor(seed * 10)
  );
  pokerState.seats[seat].stack -= raiseAmount;
  pokerState.pot += raiseAmount;
  pokerState.currentAction.minRaise = raiseAmount + player.currentRaise;
  pokerState.seats[seat].currentRaise = pokerState.currentAction.minRaise;
  pokerState.currentAction.lastSeatToRaise = seat;
  console.debug({
    message: "Opponent Raised",
    seed: seed,
    opponentStack: pokerState.seats[seat].stack,
    minRaise: pokerState.currentAction.minRaise,
    raiseAmount: raiseAmount,
  });
  return pokerState;
}
