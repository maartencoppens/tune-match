import { wss } from "./websocket/websocket-server.js";

import { routeMessage } from "./websocket/message-router.js";

wss.on("connection", (ws) => {
  console.log("Client connected");

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
