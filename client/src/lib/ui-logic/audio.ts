import { Preferences } from "@capacitor/preferences";
import playerAction from "../../assets/sfx/playerAction.mp3";

let soundEffects: { [key: string]: HTMLAudioElement };

export type SoundEffect = "playerAction";

let isAudioEnabled = undefined;
let loading = false;

export function playAudio(soundEffect: SoundEffect) {
  if (!isAudioEnabled || loading) return;
  soundEffects[soundEffect].play();
}

export async function toggleAudio(): Promise<boolean> {
  isAudioEnabled = !isAudioEnabled;
  await Preferences.set({
    key: "isAudioEnabled",
    value: JSON.stringify(isAudioEnabled),
  });
  return isAudioEnabled;
}

export async function getIsAudioEnabled(): Promise<boolean> {
  if (isAudioEnabled === undefined) {
    const savedValue = JSON.parse(
      (
        await Preferences.get({
          key: "isAudioEnabled",
        })
      ).value
    );
    isAudioEnabled = savedValue !== undefined ? savedValue : true;
  }
  return isAudioEnabled;
}

export async function loadAudio() {
  loading = true;
  soundEffects = {
    playerAction: new Audio(playerAction),
  };
  loading = false;
}
