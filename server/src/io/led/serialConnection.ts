import { SerialPort } from "serialport";
import dotenv from "dotenv";

dotenv.config();

const port = new SerialPort({
  path: process.env.LED_PORT || "/dev/tty.usbmodem1101",
  baudRate: parseInt(process.env.LED_BAUD_RATE || "115200"),
});

port.on("open", () => {
  console.log("[LED] Serial connected");
});

port.on("error", (err) => {
  console.error("[LED ERROR]", err);
});

export function sendLedMessage(message: string) {
  console.log("[LED SEND]", message);

  port.write(`${message}\n`);
}
