export const ZONE_TO_INDEX = {
  RED: 0,
  BLUE: 1,
  GREEN: 2,
  YELLOW: 3,
} as const;

export type Zone = keyof typeof ZONE_TO_INDEX;

export const ZONES: Zone[] = ["RED", "BLUE", "GREEN", "YELLOW"];

export type ZoneMessage = {
  type: "zone_update";
  zone: Zone | null;
};

export interface UseZoneDwellOptions {
  wsUrl: string;
  dwellTimeMs?: number;
  onZoneConfirmed: (zone: Zone, zoneIndex: number) => void;
}
