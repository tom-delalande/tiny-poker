import type { HandState } from "../../src/lib/poker-logic/model";
import { finishTurnForPlayer } from "../../src/lib/poker-logic/hand";

describe("payouts", () => {
  test("correct payout for odd split pot", async () => {
    const handState: HandState = {
      version: 4,
      seats: [
        {
          cards: [
            {
              value: 2,
              suit: "Clubs",
            },
            {
              value: 3,
              suit: "Clubs",
            },
          ],
          stack: 0,
          out: false,
          isCurrentPlayer: false,
          lastAction: "Check",
          currentRaise: 0,
        },
        {
          cards: [
            {
              value: 2,
              suit: "Clubs",
            },
            {
              value: 3,
              suit: "Clubs",
            },
          ],
          stack: 0,
          out: false,
          isCurrentPlayer: false,
          lastAction: "Check",
          currentRaise: 0,
        },
      ],
      blinds: {
        bigBlind: 2,
        smallBlind: 1,
      },
      currentAction: {
        seatInTurn: 1,
        minRaise: 0,
        lastSeatToRaise: 0,
      },
      round: "River",
      communityCards: [],
      pot: 11,
      deck: [],
      finished: true,
      winners: [0, 1],
    };

    const newState = finishTurnForPlayer(1, handState, "");
    expect(newState.finished).toBe(true);
    expect(newState.pot).toBe(1);
  });

  test("correct payout for event split pot", async () => {
    const handState: HandState = {
      version: 4,
      seats: [
        {
          cards: [
            {
              value: 2,
              suit: "Clubs",
            },
            {
              value: 3,
              suit: "Clubs",
            },
          ],
          stack: 0,
          out: false,
          isCurrentPlayer: false,
          lastAction: "Check",
          currentRaise: 0,
        },
        {
          cards: [
            {
              value: 2,
              suit: "Clubs",
            },
            {
              value: 3,
              suit: "Clubs",
            },
          ],
          stack: 0,
          out: false,
          isCurrentPlayer: false,
          lastAction: "Check",
          currentRaise: 0,
        },
      ],
      blinds: {
        bigBlind: 2,
        smallBlind: 1,
      },
      currentAction: {
        seatInTurn: 1,
        minRaise: 0,
        lastSeatToRaise: 0,
      },
      round: "River",
      communityCards: [],
      pot: 10,
      deck: [],
      finished: true,
      winners: [0, 1],
    };

    const newState = finishTurnForPlayer(1, handState, "");
    expect(newState.finished).toBe(true);
    expect(newState.pot).toBe(0);
  });
});
