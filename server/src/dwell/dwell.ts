import { installationState } from "../state/installation-state.js";
import { broadcast } from "../websocket/broadcast.js";
import { EVENTS } from "../shared/events.js";
import { transitionToAnswerReveal } from "../state/phase-manager.js";

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

      // Store the selected zone for this question
      installationState.selections.push(zone as any);

      // Broadcast that selection is confirmed
      broadcast({
        type: EVENTS.SELECTION_CONFIRMED,
        zone,
      });

      console.log("SELECTION CONFIRMED:", zone);

      // Transition to answer reveal phase
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
