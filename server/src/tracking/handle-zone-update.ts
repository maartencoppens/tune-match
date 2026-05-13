import { installationState } from "../state/installation-state.js";
import { broadcast } from "../websocket/broadcast.js";
import { EVENTS } from "../shared/events.js";
import { startDwell, stopDwell } from "../dwell/dwell.js";

export function handleZoneUpdate(zone: string): void {
  // Only process zone updates during active question phase
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

  installationState.activeZone = zone as any;

  broadcast({
    type: EVENTS.INSTALLATION_STATE,

    state: installationState,
  });

  // CENTER and NONE zones should not trigger dwell - they just stop it
  if (zone === "NONE" || zone === "CENTER") {
    stopDwell();
    return;
  }

  startDwell(zone);
}
