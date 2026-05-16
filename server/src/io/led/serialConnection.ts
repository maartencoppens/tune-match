import { SerialPort } from "serialport";

const port = new SerialPort({
  path: "/dev/tty.usbmodem1101",
  baudRate: 9600,
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
