"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ZONE_TO_INDEX,
  type Zone,
  type ZoneMessage,
  type UseZoneDwellOptions,
} from "@/core/modules/zones/types";

export function useZoneDwell({
  wsUrl,
  dwellTimeMs = 2000,
  onZoneConfirmed,
}: UseZoneDwellOptions) {
  const [dwellingZone, setDwellingZone] = useState<Zone | null>(null);
  const [dwellProgress, setDwellProgress] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const onZoneConfirmedRef = useRef(onZoneConfirmed);

  useEffect(() => {
    onZoneConfirmedRef.current = onZoneConfirmed;
  }, [onZoneConfirmed]);

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const reset = useCallback(() => {
    clearTimers();
    setDwellingZone(null);
    setDwellProgress(0);
  }, []);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as ZoneMessage;
        if (data.type !== "zone_update") return;
        clearTimers();
        setDwellingZone(null);
        setDwellProgress(0);

        if (!data.zone) return;

        const zone = data.zone;
        const startTime = Date.now();

        setDwellingZone(zone);

        progressIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / dwellTimeMs) * 100, 100);
          setDwellProgress(progress);
        }, 50);

        timerRef.current = setTimeout(() => {
          clearTimers();
          setDwellProgress(100);
          onZoneConfirmedRef.current(zone, ZONE_TO_INDEX[zone]);
        }, dwellTimeMs);
      } catch {
        console.warn("[WS] ongeldig bericht ontvangen:", event.data);
      }
    };

    ws.onclose = () => console.log("[WS] disconnected");
    ws.onerror = (e) => console.error("[WS] error:", e);

    return () => {
      ws.close();
      clearTimers();
    };
  }, [wsUrl, dwellTimeMs]);

  return { dwellingZone, dwellProgress, reset };
}
