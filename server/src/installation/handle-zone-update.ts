import { installationState } from "./installation-state.js";
import { resetIdleTimer } from "./idle-timer.js";
import { broadcastInstallationState } from "./publish-state.js";
import { startDwell, stopDwell } from "./dwell.js";

export function handleZoneUpdate(zone: string): void {
  resetIdleTimer();

  if (installationState.screen !== "question") {
    console.log(
      "ZONE_UPDATE ignored: not in question phase. Current screen:",
      installationState.screen,
    );
    return;
  }

  if (zone === installationState.activeZone) {
    return;
  }

  console.log("ZONE:", zone);

  installationState.activeZone = zone as (typeof installationState.activeZone);

  broadcastInstallationState();

  if (zone === "NONE" || zone === "CENTER") {
    stopDwell();
    return;
  }

  startDwell(zone);
}
