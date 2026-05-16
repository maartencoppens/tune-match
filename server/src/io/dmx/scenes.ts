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

  idleAmbient() {
    return sendDmx("IDLE_AMBIENT", {
      // Spot bar
      1: 255,
      2: 0,
      3: 0,
      4: 150,
      5: 255,
      6: 133,
      7: 0,
      8: 55,
      9: 0,
      10: 255,
      11: 0,
      12: 0,
      13: 150,
      14: 255,
      15: 0,

      // Laser
      20: 0,
      21: 0,
      22: 0,
      23: 0,
      24: 255,
      25: 6,
      26: 0,

      // Small blacklight
      35: 255,
      36: 255,
      37: 255,
      38: 255,
      39: 255,
      40: 0,
      41: 255,

      // Big blacklight
      50: 255,
      51: 0,
      52: 15,
      53: 0,
    });
  },

  introGlow() {
    return sendDmx("INTRO_GLOW", {
      // Spot bar
      // Rustige color fade via ch8 (255 ↔️ 95)
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 255,
      7: 0,
      8: 255,
      9: 0,
      10: 0,

      // Laser
      // Rustige stippen over muur
      20: 0,
      21: 255,
      22: 255,
      23: 0,
      24: 5,
      25: 15,
      26: 0,

      // Small blacklight
      // Uit
      35: 0,
      36: 0,
      37: 0,
      38: 0,
      39: 0,
      40: 0,
      41: 0,

      // Big blacklight
      // Gewoon aan
      50: 255,
      51: 0,
      52: 15,
      53: 0,
    });
  },

  questionIntro() {
    return sendDmx("QUESTION_INTRO", {
      // Spot bar
      // 1 vaste kleur
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 255,
      7: 0,
      8: 255,
      9: 0,
      10: 0,

      // Laser
      // Heel druk en snel
      20: 255,
      21: 255,
      22: 255,
      23: 255,
      24: 255,
      25: 255,
      26: 255,
      27: 255,

      // Small blacklight
      // Flikkeren
      35: 255,
      36: 255,
      37: 255,
      38: 255,
      39: 255,
      40: 255,
      41: 255,
      42: 255,
      43: 255,

      // Big blacklight
      // Flikkeren
      50: 255,
      51: 255,
      52: 255,
    });
  },

  questionMain() {
    return sendDmx("QUESTION_MAIN", {
      // Spot bar
      // Pulserende stipjes / rustige verandering
      1: 130,
      2: 130,
      3: 130,
      4: 130,
      5: 10,
      6: 255,
      7: 0,
      8: 255,

      // Laser
      // Rustige blauw/groene patronen
      20: 0,
      21: 0,
      22: 0,
      23: 100,
      24: 255,
      25: 15,

      // Small blacklight
      // Uit
      35: 0,
      36: 0,
      37: 0,
      38: 0,
      39: 0,
      40: 0,
      41: 0,
      42: 0,
      43: 0,

      // Big blacklight
      // Uit / heel lichte flicker
      50: 0,
      51: 0,
      52: 5,
    });
  },

  selectionConfirmed() {
    return sendDmx("SELECTION_CONFIRMED", {
    // Spot bar
      // 1 vaste kleur
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 255,
      7: 0,
      8: 255,
      9: 0,
      10: 0,

      // Laser
      // Heel druk en snel
      20: 255,
      21: 255,
      22: 255,
      23: 255,
      24: 255,
      25: 255,
      26: 255,
      27: 255,

      // Small blacklight
      // Flikkeren
      35: 255,
      36: 255,
      37: 255,
      38: 255,
      39: 255,
      40: 255,
      41: 255,
      42: 255,
      43: 255,

      // Big blacklight
      // Flikkeren
      50: 255,
      51: 255,
      52: 255,
    });
  },

  resultClimax() {
    return sendDmx("RESULT_CLIMAX", {
      // Spot bar
      // Rustige kleurverandering via ch8
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 255,
      7: 0,
      8: 255,
      9: 0,
      10: 0,

      // Laser
      // Rustige stippen over muur
      20: 0,
      21: 255,
      22: 255,
      23: 0,
      24: 0,
      25: 255,

      // Small blacklight
      // Pulseren
      35: 255,
      36: 255,
      37: 255,
      38: 255,
      39: 255,
      40: 255,
      41: 167,
      42: 255,
      43: 255,

      // Big blacklight
      // Beginnen flikkeren
      50: 255,
      51: 0,
      52: 15,
      53: 0,
    });
  },

  photoMoment() {
    return sendDmx("PHOTO_MOMENT", {
      // Spot bar
      // Beweging alle kleuren
      1: 255,
      2: 255,
      3: 255,
      4: 255,
      5: 95,
      6: 255,
      7: 0,
      8: 255,

      // Laser
      // Alleen lijnen/tekens die door elkaar vloeien
      20: 255,
      21: 0,
      22: 0,
      23: 255,
      24: 255,
      25: 35,

      // Small blacklight
      // Snel flikkeren
      35: 255,
      36: 255,
      37: 255,
      38: 255,
      39: 255,
      40: 155,
      41: 0,

      // Big blacklight
      // Rustig flikkeren
      50: 30,
      51: 180,
      52: 15,
    });
  },
};
