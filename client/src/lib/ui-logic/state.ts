import { writable } from "svelte/store";
import type { GameState, HandState } from "../poker-logic/model";
import { Preferences } from "@capacitor/preferences";
import { bots } from "../poker-logic/ai/bots";

export const handState = writable<HandState>();
export const botGameState = writable<GameState>();

Preferences.get({ key: "gameState" }).then((result) => {
  if (result.value) {
    botGameState.set(JSON.parse(result.value));
  } else {
    botGameState.set({
      currentBotIndex: 0,
      currentScore: 0,
      targetScore: bots[0].points,
      characterCardSeen: false,
    });
  }
});

Preferences.get({ key: "handState" }).then((result) => {
  if (result.value !== undefined) {
    handState.set(JSON.parse(result.value));
  }
});

export let currentBotGameState: GameState;
botGameState.subscribe((value) => {
  if (value === undefined || value === null) return;
  Preferences.set({ key: "gameState", value: JSON.stringify(value) });
  currentBotGameState = value;
});

handState.subscribe((value) => {
  if (value === undefined || value === null) return;
  Preferences.set({ key: "handState", value: JSON.stringify(value) });
});
