import type { Zone } from "../shared/events.js";

export type Screen = "idle" | "intro" | "question" | "result" | "photo";

export const installationState = {
  screen: "idle" as Screen,

  activeZone: "NONE" as Zone,

  currentQuestion: 0,

  dwellProgress: 0,

  selections: [] as Zone[],
};
