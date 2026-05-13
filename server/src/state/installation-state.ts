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
  screen: "question" as Screen,

  activeZone: "NONE" as Zone,

  currentQuestion: 0,

  maxQuestions: MAX_QUESTIONS,

  dwellProgress: 0,

  selections: [] as Zone[],

  revealDelayMs: 1500,
};
