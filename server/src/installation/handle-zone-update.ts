import { installationState } from "./installation-state.js";
import { transitionToIntro } from "./phase-manager.js";
import { resetIdleTimer } from "./idle-timer.js";
import { broadcastInstallationState } from "./publish-state.js";
import { startDwell, stopDwell } from "./dwell.js";

export function handleZoneUpdate(zone: string): void {
  // Only track inactivity during idle and quiz; timed screens use phase-manager timers.
  if (
    installationState.screen === "idle" ||
    installationState.screen === "question"
  ) {
    resetIdleTimer();
  }

  switch (installationState.screen) {
    case "idle":
      handleIdleZone(zone);
      break;
    case "question":
      handleQuestionZone(zone);
      break;
    default:
      break;
  }
}

function handleIdleZone(zone: string): void {
  if (zone !== "CENTER") {
    return;
  }

  console.log("[ZONE] CENTER in idle → starting intro");
  transitionToIntro();
}

function handleQuestionZone(zone: string): void {
  if (zone === installationState.activeZone) {
    return;
  }

  console.log("ZONE:", zone);

  installationState.activeZone = zone as (typeof installationState.activeZone);

  broadcastInstallationState();

  if (zone === "NONE" || zone === "CENTER") {
    stopDwell();
    return;
  }

  startDwell(zone);
}
