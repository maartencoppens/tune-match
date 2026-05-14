import { wss } from "./websocket/websocket-server.js";

import { routeMessage } from "./websocket/message-router.js";
import { broadcast } from "./websocket/broadcast.js";
import { EVENTS } from "./shared/events.js";
import { installationState } from "./state/installation-state.js";
import { syncDmxWithInstallationState } from "./dmx/dmxController.js";
import { playSoundForScreen } from "./audio/audioController.js";

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send current state to newly connected client
  ws.send(
    JSON.stringify({
      type: EVENTS.INSTALLATION_STATE,
      state: installationState,
    }),
  );

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());

      routeMessage(message);
    } catch (error) {
      console.error("Invalid WS message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Ensure DMX reflects initial installation state at startup
playSoundForScreen(installationState.screen);
syncDmxWithInstallationState(installationState);
