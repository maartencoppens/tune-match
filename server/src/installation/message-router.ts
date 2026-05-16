import { EVENTS } from "../shared/events.js";
import { handleZoneUpdate } from "./handle-zone-update.js";

export function routeMessage(message: { type?: string; zone?: string }): void {
  switch (message.type) {
    case EVENTS.ZONE_UPDATE:
      handleZoneUpdate(message.zone ?? "NONE");
      break;

    default:
      console.log("Unknown message:", message);
  }
}
