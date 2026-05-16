import { EVENTS } from "../shared/events.js";
import { broadcast } from "../io/websocket/broadcast.js";
import { installationState } from "./installation-state.js";
import { transitionToAnswerReveal } from "./phase-manager.js";

let dwellInterval: NodeJS.Timeout | null = null;

const DWELL_TIME = 2000;

export function startDwell(zone: string): void {
  stopDwell();

  const startTime = Date.now();

  dwellInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;

    const progress = Math.min((elapsed / DWELL_TIME) * 100, 100);

    installationState.dwellProgress = progress;

    broadcast({
      type: EVENTS.DWELL_PROGRESS,
      progress,
      zone,
    });

    if (progress >= 100) {
      stopDwell();

      installationState.selections.push(zone as (typeof installationState.selections)[number]);

      broadcast({
        type: EVENTS.SELECTION_CONFIRMED,
        zone,
      });

      console.log("SELECTION CONFIRMED:", zone);

      transitionToAnswerReveal();
    }
  }, 50);
}

export function stopDwell(): void {
  if (dwellInterval) {
    clearInterval(dwellInterval);
    dwellInterval = null;
  }

  installationState.dwellProgress = 0;
}
