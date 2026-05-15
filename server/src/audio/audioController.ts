// src/audio/audioController.ts

import path from "node:path";
import player from "play-sound";
import type { Screen } from "../state/installation-state.js";

const audio = player();

const DEBUG_AUDIO = true;

type AudioGroup = "idle" | "intro" | "quiz" | "result" | "none";

const audioGroupByScreen: Record<Screen, AudioGroup> = {
  idle: "idle",
  intro: "intro",

  // zelfde muziek blijft spelen
  question: "quiz",
  answer_reveal: "quiz",

  result: "result",
  photo: "none",
};

const soundByAudioGroup: Record<AudioGroup, string | null> = {
  idle: "idle.mp3",
  intro: "intro.mp3",
  quiz: "question.mp3",
  result: "result.mp3",
  none: null,
};

let currentProcess: ReturnType<typeof audio.play> | null = null;
let currentAudioGroup: AudioGroup | null = null;

function logAudio(message: string) {
  if (DEBUG_AUDIO) console.log(`[AUDIO] ${message}`);
}

function stopCurrentSound() {
  if (!currentProcess) return;

  currentProcess.kill();
  currentProcess = null;

  logAudio("Stopped current sound");
}

function getSoundPath(filename: string) {
  return path.join(process.cwd(), "src", "assets", "sounds", filename);
}

export function playSoundForScreen(screen: Screen) {
  const nextAudioGroup = audioGroupByScreen[screen];

  // Belangrijk:
  // question -> answer_reveal -> question blijft dezelfde audio group.
  // Dus muziek wordt niet opnieuw gestart.
  if (nextAudioGroup === currentAudioGroup) {
    return;
  }

  currentAudioGroup = nextAudioGroup;

  const soundFile = soundByAudioGroup[nextAudioGroup];

  stopCurrentSound();

  if (!soundFile) {
    logAudio(`No sound for audio group: ${nextAudioGroup}`);
    return;
  }

  const soundPath = getSoundPath(soundFile);

  logAudio(`Playing ${soundFile} for audio group: ${nextAudioGroup}`);

  currentProcess = audio.play(soundPath, (err) => {
    if (err) {
      console.error("[AUDIO ERROR]", err);
    }
  });
}

export function playSelectionSound() {
  const soundPath = getSoundPath("confirm.mp3");

  logAudio("Playing selection confirm sound");

  audio.play(soundPath, (err) => {
    if (err) {
      console.error("[AUDIO ERROR]", err);
    }
  });
}

export function stopAllAudio() {
  currentAudioGroup = null;
  stopCurrentSound();
}
