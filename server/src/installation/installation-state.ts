import type { Zone } from "../shared/events.js";

export const MAX_QUESTIONS = 5;

export type Screen =
  | "idle"
  | "intro"
  | "question"
  | "answer_reveal"
  | "result"
  | "photo";

export const installationState = {
  screen: "idle" as Screen,

  activeZone: "NONE" as Zone,

  currentQuestion: 0,

  maxQuestions: MAX_QUESTIONS,

  dwellProgress: 0,

  selections: [] as Zone[],

  /** Time on answer_reveal before next question or result */
  revealDelayMs: 1500,

  /** Explanation / intro screen */
  introDurationMs: 30_000,

  /** Result screen before photo */
  resultDurationMs: 10_000,

  /** Photo screen before returning to idle */
  photoDurationMs: 30_000,
};
