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
    description:
      "Emma is a tight and aggressive poker opponent. She plays conservatively, only entering pots with strong hands, but when she does, she plays them aggressively.",
    tips: [
      "Wait for premium hands before challenging Emma.",
      "If Emma raises, consider re-raising with a strong hand to build the pot. She may fold if she doesn't have a monster hand herself.",
      "Emma is less likely to fold to bluffs, so save your bluffs for opponents who are more likely to fold.",
    ],
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
    description:
      "Josh is a very loose and moderately aggressive poker opponent. He frequently plays a wide range of hands and is often in the action. He likes to bet and raise, taking risks more often than not.",
    tips: [
      "Given Josh's loose style, it's crucial to be extremely patient and only play the strongest of hands.",
      "Keep a close eye on Josh's tendencies. If he tightens up temporarily or changes his aggression level, adjust your strategy accordingly.",
    ],
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
    description:
      "Kate is a moderately loose and moderately aggressive poker opponent. She plays a variety of hands and is not afraid to mix aggression with her strategy.",
    tips: [
      "Play a balanced range of strong and speculative hands.",
      "Keep a close eye on Kate's betting patterns.",
      "When you have a strong hand, focus on extracting value from Kate by making well-timed bets and raises.",
    ],
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
