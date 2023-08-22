import { writable } from "svelte/store";

export type Route = "Home" | "BotsGame" | "CharacterCard" | "BotSelectionScreen";

export const route = writable<Route>("Home");
