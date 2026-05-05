import { WebSocketServer, WebSocket } from "ws";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (client) => {
  console.log("[WS] client connected");

  client.on("message", (msg) => {
    const text = msg.toString();
    console.log("[WS] received:", text);

    wss.clients.forEach((peer) => {
      if (peer !== client && peer.readyState === WebSocket.OPEN) {
        peer.send(text);
      }
    });
  });

  client.on("close", () => {
    console.log("[WS] client disconnected");
  });
});

console.log(`[WS] server listening on ws://localhost:${PORT}`);
