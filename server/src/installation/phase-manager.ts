import { stopDwell } from "./dwell.js";
import { installationState, MAX_QUESTIONS } from "./installation-state.js";
import { publishInstallationState } from "./publish-state.js";

let scheduledTimeoutId: NodeJS.Timeout | null = null;

function clearScheduledTransition(): void {
  if (scheduledTimeoutId) {
    clearTimeout(scheduledTimeoutId);
    scheduledTimeoutId = null;
  }
}

function scheduleTransition(fn: () => void, delayMs: number): void {
  clearScheduledTransition();
  scheduledTimeoutId = setTimeout(fn, delayMs);
}

function resetSessionState(): void {
  installationState.currentQuestion = 0;
  installationState.selections = [];
  installationState.dwellProgress = 0;
  installationState.activeZone = "NONE";
}

function applyScreen(screen: (typeof installationState)["screen"]): void {
  installationState.screen = screen;
  installationState.activeZone = "NONE";
  installationState.dwellProgress = 0;
}

export function transitionToIdle(): void {
  clearScheduledTransition();
  stopDwell();
  resetSessionState();
  applyScreen("idle");
  publishInstallationState();
  console.log("[FLOW] → idle");
}

export function transitionToIntro(): void {
  clearScheduledTransition();
  stopDwell();
  resetSessionState();
  applyScreen("intro");
  publishInstallationState();
  console.log("[FLOW] → intro");

  scheduleTransition(
    () => transitionToQuestion(),
    installationState.introDurationMs,
  );
}

export function transitionToQuestion(): void {
  clearScheduledTransition();
  stopDwell();
  applyScreen("question");
  publishInstallationState();
  console.log("[FLOW] → question", installationState.currentQuestion);
}

export function transitionToAnswerReveal(): void {
  clearScheduledTransition();
  stopDwell();
  applyScreen("answer_reveal");
  publishInstallationState();
  console.log("[FLOW] → answer_reveal");

  scheduleTransition(
    () => transitionAfterReveal(),
    installationState.revealDelayMs,
  );
}

function transitionAfterReveal(): void {
  const isFinalQuestion =
    installationState.currentQuestion >= MAX_QUESTIONS - 1;

  if (isFinalQuestion) {
    transitionToResult();
    return;
  }

  installationState.currentQuestion += 1;
  transitionToQuestion();
}

export function transitionToResult(): void {
  clearScheduledTransition();
  stopDwell();
  applyScreen("result");
  publishInstallationState();
  console.log("[FLOW] → result");

  scheduleTransition(
    () => transitionToPhoto(),
    installationState.resultDurationMs,
  );
}

export function transitionToPhoto(): void {
  clearScheduledTransition();
  stopDwell();
  applyScreen("photo");
  publishInstallationState();
  console.log("[FLOW] → photo");

  scheduleTransition(
    () => transitionToIdle(),
    installationState.photoDurationMs,
  );
}
