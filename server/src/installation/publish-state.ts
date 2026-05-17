import { EVENTS } from "../shared/events.js";
import { playSoundForScreen } from "../io/audio/audioController.js";
import { syncDmxWithInstallationState } from "../io/dmx/dmxController.js";
import { broadcast } from "../io/websocket/broadcast.js";
import { installationState } from "./installation-state.js";
import { sendLedUpdate } from "../io/led/serialConnection.js";

export function broadcastInstallationState(): void {
  broadcast({
    type: EVENTS.INSTALLATION_STATE,
    state: installationState,
  });
}

export function publishInstallationState(): void {
  syncDmxWithInstallationState(installationState);
  playSoundForScreen(installationState.screen);
  broadcastInstallationState();

  try {
    function zoneToLedPosition(z: (typeof installationState)["activeZone"]) {
      switch (z) {
        case "RED":
          return "left" as const;
        case "BLUE":
          return "top" as const;
        case "GREEN":
          return "right" as const;
        case "YELLOW":
          return "bottom" as const;
        case "CENTER":
          return "center" as const;
        default:
          return null;
      }
    }

    const pos = zoneToLedPosition(installationState.activeZone as any);
    if (pos) sendLedUpdate(pos);
  } catch (err) {
    console.warn("[LED] Failed to send zone update", err);
  }
}
