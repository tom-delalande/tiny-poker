import { BotInformation } from "../model";
import bot1Avatar from "../../../assets/bot-1-avatar.png";

export const bot1: BotInformation = {
  id: "tim",
  name: 'Tim "Easygoing" Thompson',
  description:
    "Tim's play-style is loose and passive. He rarely folds and prefers to call and check rather than raise. He enjoys seeing flops and relies on luck rather than aggressive tactics.",
  tips: [
    "Play strong starting hands against Tim's wide range.",
    "Bet confidently with strong hands for maximum value.",
  ],
  looseness: 1,
  aggression: 0,
  avatar: bot1Avatar,
  buyIn: [
    {
      chips: 10,
      chipsCost: 0,
      gemsCost: 0,
    },
    {
      chips: 15,
      chipsCost: 15,
      gemsCost: 1,
    },
    {
      chips: 20,
      chipsCost: 20,
      gemsCost: 2,
    },
  ],
};

export const bot2: BotInformation = {
  id: "emma",
  name: "Emma",
  description:
    "Tim's play-style is loose and passive. He rarely folds and prefers to call and check rather than raise. He enjoys seeing flops and relies on luck rather than aggressive tactics.",
  tips: [
    "Play strong starting hands against Tim's wide range.",
    "Bet confidently with strong hands for maximum value.",
  ],
  looseness: 1,
  aggression: 0,
  avatar: bot1Avatar,
  buyIn: [
    {
      chips: 200,
      chipsCost: 200,
      gemsCost: 0,
    },
  ],
};

export const bots = [bot1, bot2];
