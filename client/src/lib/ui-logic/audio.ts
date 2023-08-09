import playerAction from "../../assets/sfx/playerAction.wav";

// Expensive & Slow

const soundEffects = {
  playerAction: new Audio(playerAction),
};

export type SoundEffect = "playerAction";

export let isAudioEnabled = true;
export function toggleAudio(): boolean {
  isAudioEnabled = !isAudioEnabled;
  return isAudioEnabled;
}
export function playAudio(soundEffect: SoundEffect) {
  if (!isAudioEnabled) return;
  soundEffects[soundEffect].play();
}
