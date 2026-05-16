import { transitionToIdle } from "./phase-manager.js";

const IDLE_TIMEOUT_MS = 2 * 60 * 1000;

let idleTimer: NodeJS.Timeout | null = null;

export function resetIdleTimer(): void {
  if (idleTimer) {
    clearTimeout(idleTimer);
  }

  idleTimer = setTimeout(() => {
    console.log("[IDLE TIMER] No zone updates received. Going to idle.");
    transitionToIdle();
  }, IDLE_TIMEOUT_MS);
}
