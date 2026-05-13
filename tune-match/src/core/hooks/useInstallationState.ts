"use client";

import { useEffect, useState } from "react";

import type { Zone } from "@/core/modules/zones/types";

export type { Zone };

export type InstallationZone = Zone | "CENTER" | "NONE";

export type InstallationState = {
  screen: string;

  activeZone: InstallationZone;

  currentQuestion: number;

  maxQuestions: number;

  dwellProgress: number;

  selections: Zone[];
};

type ServerMessage =
  | {
      type: "INSTALLATION_STATE";
      state: InstallationState;
    }
  | {
      type: "DWELL_PROGRESS";
      progress: number;
      zone: InstallationZone;
    }
  | {
      type: "SELECTION_CONFIRMED";
      zone: InstallationZone;
    };

export function useInstallationState() {
  const [installationState, setInstallationState] =
    useState<InstallationState | null>(null);

  const [dwellProgress, setDwellProgress] = useState(0);

  const [activeZoneFromDwell, setActiveZoneFromDwell] =
    useState<InstallationZone | null>(null);

  const [confirmedZone, setConfirmedZone] = useState<InstallationZone | null>(
    null,
  );

  const resetConfirmedZone = () => setConfirmedZone(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as ServerMessage;

      switch (message.type) {
        case "INSTALLATION_STATE":
          setInstallationState(message.state);
          setActiveZoneFromDwell(null);

          break;

        case "DWELL_PROGRESS":
          setDwellProgress(message.progress);
          setActiveZoneFromDwell(message.zone);

          break;

        case "SELECTION_CONFIRMED":
          setConfirmedZone(message.zone);

          break;
      }
    };

    return () => ws.close();
  }, []);

  return {
    installationState,

    dwellProgress,

    activeZoneFromDwell,

    confirmedZone,

    resetConfirmedZone,
  };
}
