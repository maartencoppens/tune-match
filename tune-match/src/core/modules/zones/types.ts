export const ZONE_TO_INDEX = {
  top: 0,
  right: 1,
  bottom: 2,
  left: 3,
} as const;

export type Zone = keyof typeof ZONE_TO_INDEX;

export const ZONES: Zone[] = ["top", "right", "bottom", "left"];

export type ZoneMessage = {
  type: "zone_update";
  zone: Zone | null;
};

export interface UseZoneDwellOptions {
  wsUrl: string;
  dwellTimeMs?: number;
  onZoneConfirmed: (zone: Zone, zoneIndex: number) => void;
}
