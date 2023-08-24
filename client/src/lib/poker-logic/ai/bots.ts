import { BotInformation } from "../model";
import bot1Avatar from "../../../assets/bot-1-avatar.png";
import { botGameState, gameStateRead } from "../../ui-logic/state";

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
  maxGems: 200,
  avatar: bot1Avatar,
};

export const bots = [bot1];

export function botCompleted(botId: string) {
  const botIndex = bots.findIndex((bot) => bot.id === botId);
  if (botIndex + 1 < bots.length) {
    const nextBot = bots[botIndex + 1];
    const newState = gameStateRead;
    newState.bots[nextBot.id].unlocked = true;
    botGameState.set(newState);
  }
}
