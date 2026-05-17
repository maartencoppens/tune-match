"use client";

import { useEffect, useState } from "react";
import dotenv from "dotenv";

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
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    const INITIAL_RECONNECT_DELAY = 1000;

    const connect = () => {
      try {
        const wsUrl =
          // Client-exposed env variable (Next.js exposes NEXT_PUBLIC_* to browser)
          (process.env.NEXT_PUBLIC_WEBSOCKET_URL as string) ||
          (process.env.WEBSOCKET_URL as string) ||
          "ws://localhost:8080";

        ws = new WebSocket(wsUrl);

        const handleMessage = (event: MessageEvent) => {
          try {
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
          } catch (error) {
            console.error(
              "[useInstallationState] Error parsing WebSocket message:",
              error,
            );
          }
        };

        const handleOpen = () => {
          reconnectAttempts = 0;
          console.log("[useInstallationState] WebSocket connected");
        };

        const handleError = (event: Event) => {
          console.error("[useInstallationState] WebSocket error:", event);
        };

        const handleClose = () => {
          console.warn(
            "[useInstallationState] WebSocket closed, attempting reconnect...",
          );
          ws = null;

          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const delay =
              INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
            reconnectTimeout = setTimeout(() => {
              reconnectAttempts++;
              connect();
            }, delay);
          } else {
            console.error(
              "[useInstallationState] Max reconnection attempts reached",
            );
          }
        };

        ws.addEventListener("message", handleMessage);
        ws.addEventListener("open", handleOpen);
        ws.addEventListener("error", handleError);
        ws.addEventListener("close", handleClose);
      } catch (error) {
        console.error(
          "[useInstallationState] WebSocket connection failed:",
          error,
        );
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return {
    installationState,

    dwellProgress,

    activeZoneFromDwell,

    confirmedZone,

    resetConfirmedZone,
  };
}
