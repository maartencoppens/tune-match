import { wss } from "./io/websocket/websocket-server.js";
import { routeMessage } from "./installation/message-router.js";
import { EVENTS } from "./shared/events.js";
import { installationState } from "./installation/installation-state.js";
import { publishInstallationState } from "./installation/publish-state.js";

wss.on("connection", (ws) => {
  console.log("Client connected");

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

publishInstallationState();
