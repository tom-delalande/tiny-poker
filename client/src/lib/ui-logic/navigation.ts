import { writable } from "svelte/store";
import { BotInformation } from "../poker-logic/model";
import { logEvent } from "../analytics/analytics";

export type Page =
  | HomePage
  | BotsGamePage
  | CharacterCardPage
  | StorePage
  | BotSelectionScreenPage
  | UpcommingFeaturesPage
  | EmailSubmittionPage
  | AddedGemsPage;

export interface HomePage {
  route: "Home";
}

export interface BotsGamePage {
  route: "BotsGame";
  bot: BotInformation;
  startingStack: number;
}

export interface CharacterCardPage {
  route: "CharacterCard";
  bot: BotInformation;
  backEnabled?: boolean;
}

export interface BotSelectionScreenPage {
  route: "BotSelectionScreen";
}

export interface StorePage {
  route: "Store";
}

export interface UpcommingFeaturesPage {
  route: "UpcommingFeatures";
}

export interface EmailSubmittionPage {
  route: "EmailSubmittion";
  preferences: string[];
}

export interface AddedGemsPage {
  route: "AddedGems";
  gems: number;
}

export const router = writable<Page>({
  route: "Home",
});

router.subscribe((page) => {
  logEvent("page-opened", {
    page,
  });
});
