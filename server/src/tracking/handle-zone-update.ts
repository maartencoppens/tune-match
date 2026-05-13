import { installationState } from "../state/installation-state.js";
import { broadcast } from "../websocket/broadcast.js";
import { EVENTS } from "../shared/events.js";
import { startDwell, stopDwell } from "../dwell/dwell.js";

export function handleZoneUpdate(zone: string): void {
  if (zone === installationState.activeZone) {
    return;
  }

  console.log("ZONE:", zone);

  installationState.activeZone = zone as any;

  broadcast({
    type: EVENTS.INSTALLATION_STATE,

    state: installationState,
  });

  if (zone === "NONE") {
    stopDwell();
    return;
  }

  startDwell(zone);
}
