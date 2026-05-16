import { installationState, MAX_QUESTIONS } from "./installation-state.js";
import { publishInstallationState } from "./publish-state.js";

let revealTimeoutId: NodeJS.Timeout | null = null;

export function transitionToAnswerReveal(): void {
  installationState.screen = "answer_reveal";
  installationState.activeZone = "NONE";
  installationState.dwellProgress = 0;

  publishInstallationState();

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

  if (!isFinalQuestion) {
    installationState.currentQuestion += 1;
    installationState.screen = "question";
  } else {
    installationState.screen = "result";
  }

  installationState.activeZone = "NONE";
  installationState.dwellProgress = 0;

  publishInstallationState();

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
