import { installationState, MAX_QUESTIONS } from "./installation-state.js";
import { broadcast } from "../websocket/broadcast.js";
import { EVENTS } from "../shared/events.js";
import { syncDmxWithInstallationState } from "../dmx/dmxController.js";
import { playSoundForScreen } from "../audio/audioController.js";

let revealTimeoutId: NodeJS.Timeout | null = null;

export function transitionToAnswerReveal(): void {
  // Change to answer reveal screen
  installationState.screen = "answer_reveal";

  // Reset active zone so user must return to CENTER
  installationState.activeZone = "NONE";

  // Reset dwell progress
  installationState.dwellProgress = 0;

  // Broadcast the new state
  syncDmxWithInstallationState(installationState);
  playSoundForScreen(installationState.screen);
  broadcast({
    type: EVENTS.INSTALLATION_STATE,
    state: installationState,
  });

  // Schedule transition to next question after reveal delay
  if (revealTimeoutId) {
    clearTimeout(revealTimeoutId);
  }
  revealTimeoutId = setTimeout(() => {
    transitionToNextQuestion();
  }, installationState.revealDelayMs);
}

export function transitionToNextQuestion(): void {
  const isFinalQuestion =
    installationState.currentQuestion >= MAX_QUESTIONS - 1;

  // Move to next question unless we already reached the last one
  if (!isFinalQuestion) {
    installationState.currentQuestion += 1;
    installationState.screen = "question";
  } else {
    // Transition to result screen
    installationState.screen = "result";
  }

  // Reset active zone
  installationState.activeZone = "NONE";

  // Reset dwell progress
  installationState.dwellProgress = 0;

  // Broadcast the new state
  syncDmxWithInstallationState(installationState);
  playSoundForScreen(installationState.screen);
  broadcast({
    type: EVENTS.INSTALLATION_STATE,
    state: installationState,
  });

  console.log(
    isFinalQuestion
      ? "REACHED FINAL QUESTION: transitioning to result"
      : "TRANSITIONED TO NEXT QUESTION:",
    installationState.currentQuestion,
  );
}

export function cancelRevealTimeout(): void {
  if (revealTimeoutId) {
    clearTimeout(revealTimeoutId);
    revealTimeoutId = null;
  }
}
