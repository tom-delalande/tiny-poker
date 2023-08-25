import { writable } from "svelte/store";
import type { GameState, HandState } from "../poker-logic/model";
import { Preferences } from "@capacitor/preferences";

export const gameState = writable<GameState>();
export const localHands = writable<LocalHands>();

type LocalHands = {
  version: 1;
  hands: { [botId: string]: HandState };
};

export async function updateHandForBot(botId: string, hand: HandState) {
  console.log({
    message: "Update hand for bot.",
    botId,
    hand,
  });
  localHands.update((prev) => {
    if (prev) {
      prev.hands[botId] = hand;
      return prev;
    }
    const state: LocalHands = {
      version: 1,
      hands: {},
    };
    state.hands[botId] = hand;
    return state;
  });
}

Preferences.get({ key: "game-state" }).then((result) => {
  if (result.value) {
    const state: GameState = JSON.parse(result.value);
    if (state && state.version === 5) {
      return gameState.set(state);
    }
  }
  gameState.set({
    version: 5,
    chips: 0,
    gems: 0,
  });
});

Preferences.get({ key: "local-hands" }).then((result) => {
  if (result.value !== undefined) {
    const state: LocalHands = JSON.parse(result.value);
    if (state && state.version === 1) {
      localHands.set(JSON.parse(result.value));
    } else {
      return {
        version: 1,
        hands: {},
      };
    }
  }
});

export let currentBotGameState: GameState;
gameState.subscribe((value) => {
  if (value === undefined || value === null) return;
  Preferences.set({ key: "game-state", value: JSON.stringify(value) });
  currentBotGameState = value;
});

localHands.subscribe((value) => {
  if (value === undefined || value === null) return;
  Preferences.set({
    key: "local-games",
    value: JSON.stringify(value),
  });
});
