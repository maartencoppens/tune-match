import { installationState } from "./installation-state.js";
import { publishInstallationState } from "./publish-state.js";

const IDLE_TIMEOUT_MS = 2 * 60 * 1000;

let idleTimer: NodeJS.Timeout | null = null;

export function resetIdleTimer(): void {
  if (idleTimer) {
    clearTimeout(idleTimer);
  }

  idleTimer = setTimeout(() => {
    goToIdleBecauseOfInactivity();
  }, IDLE_TIMEOUT_MS);
}

function goToIdleBecauseOfInactivity(): void {
  console.log("[IDLE TIMER] No zone updates received. Going to idle.");

  installationState.screen = "idle";
  installationState.activeZone = "NONE";
  installationState.dwellProgress = 0;

  publishInstallationState();
}
