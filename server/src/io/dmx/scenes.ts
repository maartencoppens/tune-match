import { updateDmx } from "./dmxEngine.js";

export type DmxValue = number;
export type DmxFrame = Record<number, DmxValue>;

const DEBUG_DMX = true;

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function logScene(sceneName: string, frame: DmxFrame) {
  if (!DEBUG_DMX) return;

  console.log(`\n[DMX SCENE] ${sceneName}`);
  console.table(frame);
}

function sendDmx(sceneName: string, frame: DmxFrame): DmxFrame {
  const safeFrame: DmxFrame = {};

  for (const [channel, value] of Object.entries(frame)) {
    safeFrame[Number(channel)] = clamp(value);
  }

  logScene(sceneName, safeFrame);

  updateDmx(safeFrame);
  return safeFrame;
}

const ALL_DMX_CHANNELS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 21, 22, 23, 24, 25, 26,
  35, 36, 37, 38, 39, 40, 41, 50, 51, 52, 53,
];

function createBlackoutFrame(): DmxFrame {
  return Object.fromEntries(ALL_DMX_CHANNELS.map((channel) => [channel, 0]));
}

export const dmxScenes = {
  blackout() {
    return sendDmx("BLACKOUT", createBlackoutFrame());
  },

  idleAmbient() {
    return sendDmx("IDLE_AMBIENT", {
      1: 80,
      2: 0,
      3: 40,
      4: 120,
      5: 0,
      6: 0,
      7: 40,
      8: 80,
      9: 120,
      10: 0,
      11: 0,
      12: 30,
      13: 80,
      14: 120,
      15: 0,
      20: 0,
      21: 0,
      22: 0,
      23: 0,
      24: 0,
      25: 0,
      26: 0,
      35: 120,
      36: 120,
      37: 120,
      38: 120,
      39: 120,
      40: 0,
      41: 0,
      50: 120,
      51: 0,
      52: 0,
      53: 0,
    });
  },

  introGlow() {
    return sendDmx("INTRO_GLOW", {
      1: 150,
      2: 30,
      3: 80,
      4: 180,
      5: 0,
      6: 30,
      7: 80,
      8: 180,
      9: 0,
      10: 30,
      11: 80,
      12: 180,
      13: 30,
      14: 80,
      15: 180,
      20: 0,
      21: 0,
      22: 0,
      23: 0,
      24: 0,
      25: 0,
      26: 0,
      35: 180,
      36: 180,
      37: 180,
      38: 180,
      39: 180,
      40: 0,
      41: 0,
      50: 180,
      51: 0,
      52: 0,
      53: 0,
    });
  },

  questionBlue() {
    return sendDmx("QUESTION_BLUE", {
      1: 120,
      2: 0,
      3: 20,
      4: 180,
      5: 0,
      6: 0,
      7: 20,
      8: 180,
      9: 0,
      10: 0,
      11: 20,
      12: 180,
      13: 0,
      14: 20,
      15: 180,
      20: 0,
      21: 0,
      22: 0,
      23: 0,
      24: 0,
      25: 0,
      26: 0,
      35: 180,
      36: 180,
      37: 180,
      38: 180,
      39: 180,
      40: 0,
      41: 0,
      50: 180,
      51: 0,
      52: 0,
      53: 0,
    });
  },

  zoneRedPulse() {
    return sendDmx("ZONE_RED_PULSE", {
      1: 255,
      2: 255,
      3: 0,
      4: 0,
      5: 0,
      6: 255,
      7: 0,
      8: 0,
      9: 0,
      10: 255,
      11: 0,
      12: 0,
      13: 255,
      14: 0,
      15: 0,
      20: 255,
      21: 120,
      22: 120,
      23: 255,
      24: 120,
      25: 180,
      26: 0,
      35: 255,
      36: 255,
      37: 255,
      38: 255,
      39: 255,
      40: 180,
      41: 0,
      50: 255,
      51: 0,
      52: 0,
      53: 0,
    });
  },

  selectionConfirmed() {
    return sendDmx("SELECTION_CONFIRMED", {
      1: 255,
      2: 255,
      3: 255,
      4: 255,
      5: 0,
      6: 255,
      7: 255,
      8: 255,
      9: 0,
      10: 255,
      11: 255,
      12: 255,
      13: 255,
      14: 255,
      15: 255,
      20: 255,
      21: 255,
      22: 180,
      23: 255,
      24: 180,
      25: 255,
      26: 0,
      35: 255,
      36: 255,
      37: 255,
      38: 255,
      39: 255,
      40: 220,
      41: 180,
      50: 255,
      51: 0,
      52: 180,
      53: 0,
    });
  },

  resultClimax() {
    return sendDmx("RESULT_CLIMAX", {
      1: 255,
      2: 255,
      3: 80,
      4: 200,
      5: 255,
      6: 80,
      7: 200,
      8: 255,
      9: 200,
      10: 255,
      11: 80,
      12: 255,
      13: 255,
      14: 255,
      15: 255,
      20: 255,
      21: 255,
      22: 255,
      23: 255,
      24: 255,
      25: 255,
      26: 255,
      35: 255,
      36: 255,
      37: 255,
      38: 255,
      39: 255,
      40: 200,
      41: 255,
      50: 255,
      51: 0,
      52: 255,
      53: 0,
    });
  },

  photoMoment() {
    return sendDmx("PHOTO_MOMENT", {
      1: 180,
      2: 180,
      3: 120,
      4: 255,
      5: 0,
      6: 180,
      7: 120,
      8: 255,
      9: 0,
      10: 180,
      11: 120,
      12: 255,
      13: 180,
      14: 120,
      15: 255,
      20: 0,
      21: 0,
      22: 0,
      23: 0,
      24: 0,
      25: 0,
      26: 0,
      35: 120,
      36: 120,
      37: 120,
      38: 120,
      39: 120,
      40: 0,
      41: 0,
      50: 120,
      51: 0,
      52: 0,
      53: 0,
    });
  },
};
