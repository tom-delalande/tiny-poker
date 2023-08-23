import { writable } from "svelte/store";
import type { BotSate, GameState, HandState } from "../poker-logic/model";
import { Preferences } from "@capacitor/preferences";
import { bots } from "../poker-logic/ai/bots";

export const handState = writable<HandState>();
export const botGameState = writable<GameState>();

Preferences.get({ key: "gameState" }).then((result) => {
  if (result.value) {
    const state: GameState = JSON.parse(result.value);
    if (state.version === 1) {
      return botGameState.set(state);
    }
  }
  const initialtTim: BotSate = {
    botId: bots[0].id,
    unlocked: true,
    currentGems: 0,
    maxGems: bots[0].maxGems,
  };
  botGameState.set({
    version: 1,
    bots: {
      tim: initialtTim,
    },
  });
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
