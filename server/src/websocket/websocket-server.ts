import { WebSocketServer } from "ws";

export const wss = new WebSocketServer({
  port: 8080,
});

console.log("WebSocket server running on ws://localhost:8080");
