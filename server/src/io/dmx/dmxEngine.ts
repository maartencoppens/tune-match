import DMX from "dmx";
import dotenv from "dotenv";

dotenv.config();

const dmx = new DMX();

const DEBUG_DMX_ENGINE = true;

export const universe = dmx.addUniverse(
  "tunematch",
  "enttec-usb-dmx-pro",
  process.env.DMX_PORT,
);

export function updateDmx(frame: Record<number, number>) {
  if (DEBUG_DMX_ENGINE) {
    console.log("\n[DMX ENGINE] Sending frame to Enttec USB DMX Pro");
    console.table(frame);
  }

  universe.update(frame);
}
