import { playSoundForScreen } from "../audio/audioController.js";
import { syncDmxWithInstallationState } from "../dmx/dmxController.js";
import { installationState } from "../state/installation-state.js";
import { broadcast } from "../websocket/broadcast.js";

const IDLE_TIMEOUT_MS = 2 * 60 * 1000;

let idleTimer: NodeJS.Timeout | null = null;

export function resetIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
  }

  idleTimer = setTimeout(() => {
    goToIdleBecauseOfInactivity();
  }, IDLE_TIMEOUT_MS);
}

function goToIdleBecauseOfInactivity() {
  console.log("[IDLE TIMER] No zone updates received. Going to idle.");

  installationState.screen = "idle";
  installationState.activeZone = "NONE";
  installationState.dwellProgress = 0;

  broadcast({
    type: "INSTALLATION_STATE",
    payload: installationState,
  });
  syncDmxWithInstallationState(installationState);
  playSoundForScreen(installationState.screen);
}
