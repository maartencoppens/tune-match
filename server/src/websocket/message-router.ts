import { EVENTS } from "../shared/events.js";

import { handleZoneUpdate } from "../tracking/handle-zone-update.js";

export function routeMessage(message: any): void {
  switch (message.type) {
    case EVENTS.ZONE_UPDATE:
      handleZoneUpdate(message.zone);

      break;

    default:
      console.log("Unknown message:", message);
  }
}
