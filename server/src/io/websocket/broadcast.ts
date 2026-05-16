import { WebSocket } from "ws";
import { wss } from "./websocket-server.js";

export function broadcast(data: unknown): void {
  const message = JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
