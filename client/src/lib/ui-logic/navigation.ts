import { writable } from "svelte/store";

export type Route =
  | "Home"
  | "BotsGame"
  | "CharacterCard"
  | "BotSelectionScreen";

export interface RouteWithProps {
  route: Route;
  props?: any;
}

export const route = writable<RouteWithProps>({
  route: "Home",
});
