import { dmxScenes } from "./scenes.js";
import type { Screen } from "../state/installation-state.js";
import type { Zone } from "../shared/events.js";

function logController(message: string, data?: unknown) {
  console.log(`\n[DMX CONTROLLER] ${message}`);

  if (data !== undefined) {
    console.log(data);
  }
}

export function applyLightingForScreen(screen: Screen) {
  logController(`Apply lighting for screen: ${screen}`);

  switch (screen) {
    case "idle":
      return dmxScenes.idleAmbient();

    case "intro":
      return dmxScenes.introGlow();

    case "question":
      return dmxScenes.questionBlue();

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

  // Voorlopig één algemene pulse.
  // Later kan je per zone aparte kleuren maken.
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

/**
 * Deze functie roep je aan wanneer installationState.screen verandert.
 */
export function syncDmxWithInstallationState(state: { screen: Screen }) {
  logController("Sync with installationState", state);

  return applyLightingForScreen(state.screen);
}
