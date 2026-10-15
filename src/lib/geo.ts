import type { Area } from "./types";

/** Approximate centre point of each Mumbai-region locality. */
export const AREA_COORDS: Record<Area, [number, number]> = {
  andheri: [19.1197, 72.8468],
  bandra: [19.0596, 72.8295],
  dadar: [19.0178, 72.8478],
  kurla: [19.0726, 72.8845],
  ghatkopar: [19.0858, 72.9081],
  chembur: [19.0522, 72.9005],
  powai: [19.1176, 72.906],
  lowerParel: [18.9953, 72.8296],
  colaba: [18.9067, 72.8147],
  goregaon: [19.1663, 72.8526],
  malad: [19.1874, 72.8484],
  borivali: [19.2307, 72.8567],
  thane: [19.2183, 72.9781],
  mulund: [19.1726, 72.9565],
  vashi: [19.0771, 72.9986],
  panvel: [18.9894, 73.1175],
};

/** Straight-line distance in km between two localities. */
export function distanceKm(a: Area, b: Area): number {
  if (a === b) return 1.5; // same locality: assume a short trip
  const [lat1, lon1] = AREA_COORDS[a];
  const [lat2, lon2] = AREA_COORDS[b];
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
