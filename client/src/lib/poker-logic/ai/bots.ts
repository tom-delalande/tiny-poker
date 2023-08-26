import { BotInformation } from "../model";
import bot1Avatar from "../../../assets/bot-1-avatar.svg";
import bot2Avatar from "../../../assets/bot-2-avatar.svg";
import bot3Avatar from "../../../assets/bot-3-avatar.svg";
import bot4Avatar from "../../../assets/bot-4-avatar.svg";

export const bots: BotInformation[] = [
  {
    id: "tim",
    name: "Tim",
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
        chipsCost: 10,
        gemsCost: 0,
        free: true,
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
  },
  {
    id: "emma",
    name: "Emma",
    description: "",
    tips: ["", ""],
    looseness: 0,
    aggression: 1,
    avatar: bot2Avatar,
    buyIn: [
      {
        chips: 200,
        chipsCost: 200,
        gemsCost: 0,
      },
    ],
  },
  {
    id: "josh",
    name: "Josh",
    description: "",
    tips: ["", ""],
    looseness: 0.8,
    aggression: 0.4,
    avatar: bot3Avatar,
    buyIn: [
      {
        chips: 3000,
        chipsCost: 3000,
        gemsCost: 0,
      },
      {
        chips: 6000,
        chipsCost: 6000,
        gemsCost: 100,
      },
    ],
  },
  {
    id: "kate",
    name: "Kate",
    description: "",
    tips: ["", ""],
    looseness: 0.5,
    aggression: 0.5,
    avatar: bot4Avatar,
    buyIn: [
      {
        chips: 100000,
        chipsCost: 100000,
        gemsCost: 0,
      },
      {
        chips: 200000,
        chipsCost: 200000,
        gemsCost: 1000,
      },
    ],
  },
];
