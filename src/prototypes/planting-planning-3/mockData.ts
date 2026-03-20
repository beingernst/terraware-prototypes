/**
 * Mock Data & Types for Planting Planning Prototype V3
 *
 * This file contains all data structures and mock data for:
 * - Planting sites and zones
 * - Planting seasons
 * - Species assignments
 * - Density targets
 */

// Planting site with zones
export interface PlantingSite {
  id: number;
  name: string;
  location: string;
  zones: Zone[];
  wetSeasonMonths: Set<number>; // 0-11 indexed months for wet season
}

export interface Zone {
  id: string;
  name: string;
  area: number; // hectares
}

// Planting season
export interface PlantingSeason {
  id: string;
  name: string;
  startMonth: number; // 0-11 (0 = January)
  endMonth: number; // 0-11 (11 = December)
  year: number;
  zoneIds: string[]; // zones included in this season
}

// Species assignment to zone
export interface SpeciesAssignment {
  zoneId: string;
  seasonId: string;
  speciesId: string;
  quantity: number;
}

// Density target
export interface DensityTarget {
  zoneId: string;
  targetDensity: number; // plants per hectare
}

// Species catalog
export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
}

// ============================================
// Mock Data
// ============================================

export const mockSite: PlantingSite = {
  id: 1,
  name: "Montanha do Sul",
  location: "South Region, Brazil",
  zones: [
    { id: "z1", name: "Zone A - Hillside", area: 85 },
    { id: "z2", name: "Zone B - Valley", area: 72 },
    { id: "z3", name: "Zone C - Riverside", area: 70 },
    { id: "z4", name: "Zone D - Forest Edge", area: 65 },
  ],
  wetSeasonMonths: new Set([0, 1, 2, 10, 11]), // Nov-Mar (wet season)
};

export const mockSpecies: Species[] = [
  { id: "sp1", commonName: "Acacia", scientificName: "Acacia mangium" },
  { id: "sp2", commonName: "Leucaena", scientificName: "Leucaena leucocephala" },
  { id: "sp3", commonName: "Mahogany", scientificName: "Swietenia macrophylla" },
  { id: "sp4", commonName: "Teak", scientificName: "Tectona grandis" },
  { id: "sp5", commonName: "Cedar", scientificName: "Cedrela odorata" },
  { id: "sp6", commonName: "Brazilian Rosewood", scientificName: "Dalbergia nigra" },
  { id: "sp7", commonName: "Ipe", scientificName: "Handroanthus impetiginosus" },
  { id: "sp8", commonName: "Jatoba", scientificName: "Hymenaea courbaril" },
];

// Month names for display
export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Helper function to format month ranges
export function formatMonthRanges(monthIndices: number[]): string {
  if (monthIndices.length === 0) return "No months selected";

  const sorted = [...monthIndices].sort((a, b) => a - b);
  const ranges: string[] = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === rangeEnd + 1) {
      rangeEnd = sorted[i];
    } else {
      if (rangeStart === rangeEnd) {
        ranges.push(MONTH_NAMES_FULL[rangeStart]);
      } else if (rangeEnd === rangeStart + 1) {
        ranges.push(`${MONTH_NAMES_FULL[rangeStart]} and ${MONTH_NAMES_FULL[rangeEnd]}`);
      } else {
        ranges.push(`${MONTH_NAMES_FULL[rangeStart]} through ${MONTH_NAMES_FULL[rangeEnd]}`);
      }

      if (i < sorted.length) {
        rangeStart = sorted[i];
        rangeEnd = sorted[i];
      }
    }
  }

  if (ranges.length === 1) return ranges[0];
  if (ranges.length === 2) return `${ranges[0]} and ${ranges[1]}`;

  const lastRange = ranges.pop();
  return `${ranges.join(", ")}, and ${lastRange}`;
}

// Helper function to get selection position for rounded borders
export function getSelectionPosition(
  isSelectedFn: (monthIndex: number) => boolean,
  monthIndex: number
): "single" | "start" | "middle" | "end" | null {
  const selected = isSelectedFn(monthIndex);
  if (!selected) return null;

  const prevSelected = monthIndex > 0 && isSelectedFn(monthIndex - 1);
  const nextSelected = monthIndex < 11 && isSelectedFn(monthIndex + 1);

  if (!prevSelected && !nextSelected) return "single";
  if (!prevSelected && nextSelected) return "start";
  if (prevSelected && nextSelected) return "middle";
  if (prevSelected && !nextSelected) return "end";

  return null;
}

// Helper to get border radius based on position
export function getBorderRadiusForPosition(
  position: "single" | "start" | "middle" | "end" | null
): string {
  switch (position) {
    case "single":
      return "6px";
    case "start":
      return "6px 0 0 6px";
    case "end":
      return "0 6px 6px 0";
    case "middle":
      return "0";
    default:
      return "0";
  }
}
