import path from "node:path";
import player from "play-sound";
import type { Screen } from "../../installation/installation-state.js";

const audio = player();

const DEBUG_AUDIO = true;

type AudioGroup = "idle" | "intro" | "quiz" | "result" | "none";

const audioGroupByScreen: Record<Screen, AudioGroup> = {
  idle: "idle",
  intro: "intro",

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

// single main volume value (0..1) — edit this file to change global playback loudness
const volume = 0.1;

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

  // try common player args for volume (players that don't support these will ignore them)
  const opts: Record<string, string[]> = {
    afplay: ["-v", String(volume)],
    mplayer: ["-volume", String(Math.round(volume * 100))],
    mpg123: ["-f", String(Math.round(volume * 32768))],
    vlc: ["--gain", String(volume)],
    play: ["--volume", String(volume)],
  };

  const start = () => {
    const proc = audio.play(soundPath, opts, (err) => {
      if (err) {
        console.error("[AUDIO ERROR]", err);
      }
    });

    currentProcess = proc;

    // when process exits, if the desired audio group is unchanged, restart (simple loop)
    try {
      if (proc && typeof proc.on === "function") {
        proc.on("exit", () => {
          if (currentAudioGroup === nextAudioGroup) start();
        });
      }
    } catch (e) {
      // ignore handler errors
    }
  };

  start();
}

export function playSelectionSound() {
  const soundPath = getSoundPath("confirm.mp3");

  logAudio("Playing selection confirm sound");

  const opts: Record<string, string[]> = {
    afplay: ["-v", String(volume)],
    mplayer: ["-volume", String(Math.round(volume * 100))],
    mpg123: ["-f", String(Math.round(volume * 32768))],
    vlc: ["--gain", String(volume)],
    play: ["--volume", String(volume)],
  };

  const process = audio.play(soundPath, opts, (err) => {
    if (err) {
      console.error("[AUDIO ERROR]", err);
    }
  });
}

export function stopAllAudio() {
  currentAudioGroup = null;
  stopCurrentSound();
}
