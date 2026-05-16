import { EVENTS } from "../shared/events.js";
import { playSoundForScreen } from "../io/audio/audioController.js";
import { syncDmxWithInstallationState } from "../io/dmx/dmxController.js";
import { broadcast } from "../io/websocket/broadcast.js";
import { installationState } from "./installation-state.js";

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
}
