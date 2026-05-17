import { SerialPort } from "serialport";
import dotenv from "dotenv";

dotenv.config();

type LedPosition = "left" | "top" | "right" | "bottom" | "center";

const port = new SerialPort({
  path: process.env.LED_PORT || "/dev/tty.usbmodem1101",
  baudRate: parseInt(process.env.LED_BAUD_RATE || "115200"),
});

let isReady = false;

port.on("open", () => {
  isReady = true;
  console.log("[LED] Serial connected");
});

port.on("data", (data) => {
  console.log("[LED RECEIVE]", data.toString().trim());
});

port.on("error", (err) => {
  console.error("[LED ERROR]", err);
});

export function sendLedMessage(message: string) {
  if (!isReady) {
    console.warn("[LED] Serial not ready yet");
    return;
  }

  console.log("[LED SEND]", message);
  port.write(`${message}\n`);
}

export function sendLedUpdate(position: LedPosition) {
  sendLedMessage("LED_UPDATE");
  sendLedMessage(position);
}
