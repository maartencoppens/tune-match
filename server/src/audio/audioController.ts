// src/audio/audioController.ts

import path from "node:path";
import player from "play-sound";
import type { Screen } from "../state/installation-state.js";

const audio = player();

const DEBUG_AUDIO = true;

const soundByScreen: Record<Screen, string | null> = {
  idle: "idle.mp3",
  intro: "intro.mp3",
  question: "question.mp3",
  result: "result.mp3",
  photo: null,
  answer_reveal: null,
  reset: "reset.mp3",
};

let currentProcess: ReturnType<typeof audio.play> | null = null;
let currentScreen: Screen | null = null;

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
  if (screen === currentScreen) return;

  currentScreen = screen;

  const soundFile = soundByScreen[screen];

  stopCurrentSound();

  if (!soundFile) {
    logAudio(`No sound for screen: ${screen}`);
    return;
  }

  const soundPath = getSoundPath(soundFile);

  logAudio(`Playing ${soundFile} for screen: ${screen}`);

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
  currentScreen = null;
  stopCurrentSound();
}
