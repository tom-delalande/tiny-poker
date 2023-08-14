import { writable } from "svelte/store";

export type Route = "Home" | "BotsGame" | "CharacterCard";

export const route = writable<Route>("Home");
