import { dmxScenes } from "./scenes.js";
import type { DmxFrame } from "./scenes.js";
import {
  installationState,
  type Screen,
} from "../../installation/installation-state.js";
import type { Zone } from "../../shared/events.js";

function logController(message: string, data?: unknown) {
  console.log(`\n[DMX CONTROLLER] ${message}`);

  if (data !== undefined) {
    console.log(data);
  }
}

export function applyLightingForScreen(screen: Screen) {
  logController(`Apply lighting for screen: ${screen}`);

  const questionFrame = question(screen);

  switch (screen) {
    case "idle":
      return dmxScenes.idleAmbient();

    case "intro":
      return dmxScenes.introGlow();

    case "question":
      return questionFrame;

    case "answer_reveal":
      return dmxScenes.selectionConfirmed();

    case "result":
      return dmxScenes.resultClimax();

    case "photo":
      return dmxScenes.photoMoment();

    default:
      return dmxScenes.blackout();
  }
}

export function applyZonePulse(zone: Zone) {
  if (!zone) return;

  logController(`Zone pulse: ${zone}`);

  return dmxScenes.zoneRedPulse();
}

export function applySelectionConfirmed(zone: Zone) {
  logController(`Selection confirmed: ${zone}`);

  return dmxScenes.selectionConfirmed();
}

export function applyBlackout() {
  logController("Blackout");

  return dmxScenes.blackout();
}

export function syncDmxWithInstallationState(state: { screen: Screen }) {
  logController("Sync with installationState", state);

  return applyLightingForScreen(state.screen);
}

let lastScreen: Screen | null = null;
let questionTimer: ReturnType<typeof setTimeout> | null = null;
let questionLightingId = 0;

function stopQuestionLighting(): void {
  questionLightingId += 1;
  if (questionTimer) clearTimeout(questionTimer);
  questionTimer = null;
}

function question(screen: Screen): DmxFrame | undefined {
  const enter = screen === "question" && lastScreen !== "question";
  lastScreen = screen;

  if (screen !== "question") {
    stopQuestionLighting();
    return;
  }

  if (!enter) return;

  stopQuestionLighting();
  const lightingId = questionLightingId;

  questionTimer = setTimeout(() => {
    questionTimer = null;
    if (
      lightingId !== questionLightingId ||
      installationState.screen !== "question"
    ) {
      return;
    }
    dmxScenes.questionMain();
  }, 5_000);

  return dmxScenes.questionIntro();
}
