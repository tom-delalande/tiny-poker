import type { SvelteComponent } from "svelte";
import bot1Avatar from "../../../assets/bot-1-avatar.png";
import Bot1CharacterCard from "../../Bot1CharacterCard.svelte";

export interface Bot {
  name: string;
  looseness: number;
  aggression: number;
  characterCard: typeof SvelteComponent;
  avatar: string;
  points: number;
}

export const bot1: Bot = {
  name: 'Tim "Easygoing" Thompson',
  looseness: 1,
  aggression: 0,
  characterCard: Bot1CharacterCard,
  avatar: bot1Avatar,
  points: 200,
};

export const bots = [bot1];
