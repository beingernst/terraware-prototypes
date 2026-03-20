/**
 * Mock Data for Planting Planning 2 Prototype
 *
 * Based on the Nursery Pipeline spreadsheet workflow, using Hawaiian native species.
 */

// === Type Definitions ===

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
}

export interface Zone {
  id: string;
  name: string;
  area: string;
}

export interface PlantingSite {
  id: number;
  name: string;
  location: string;
  area: string;
  zones: Zone[];
}

export interface PlantingSeason {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  siteId: number;
}

export interface SpeciesTarget {
  id: string;
  seasonId: string;
  zoneId: string;
  speciesId: string;
  targetQuantity: number;
}

export interface NurseryInventory {
  id: string;
  speciesId: string;
  availableQuantity: number;
  location: string; // e.g., "Greenhouse", "Ready", "Hardening"
}

export interface Allocation {
  id: string;
  speciesId: string;
  quantity: number;
  targetId: string; // links to SpeciesTarget
  status: "allocated" | "withdrawn" | "planted";
  allocatedDate: Date;
  withdrawnDate?: Date;
}

// === Mock Species (Hawaiian native species from spreadsheet) ===

export const mockSpecies: Species[] = [
  { id: "sp-1", commonName: "A'ali'i", scientificName: "Dodonaea viscosa" },
  {
    id: "sp-2",
    commonName: "'Aweoweo",
    scientificName: "Chenopodium oahuense",
  },
  { id: "sp-3", commonName: "Pili", scientificName: "Heteropogon contortus" },
  {
    id: "sp-4",
    commonName: "Wiliwili",
    scientificName: "Erythrina sandwicensis",
  },
  { id: "sp-5", commonName: "Naio", scientificName: "Myoporum sandwicense" },
  { id: "sp-6", commonName: "'Ilima", scientificName: "Sida fallax" },
  { id: "sp-7", commonName: "Ma'o", scientificName: "Gossypium tomentosum" },
  {
    id: "sp-8",
    commonName: "Koa",
    scientificName: "Acacia koa",
  },
  {
    id: "sp-9",
    commonName: "'Ohi'a Lehua",
    scientificName: "Metrosideros polymorpha",
  },
  {
    id: "sp-10",
    commonName: "Mamane",
    scientificName: "Sophora chrysophylla",
  },
  { id: "sp-11", commonName: "Alahe'e", scientificName: "Psydrax odorata" },
  { id: "sp-12", commonName: "Lama", scientificName: "Diospyros sandwicensis" },
  {
    id: "sp-13",
    commonName: "Koai'a",
    scientificName: "Acacia koaia",
  },
  {
    id: "sp-14",
    commonName: "Milo",
    scientificName: "Thespesia populnea",
  },
  {
    id: "sp-15",
    commonName: "Kou",
    scientificName: "Cordia subcordata",
  },
];

// === Mock Planting Sites (from spreadsheet: PF, MM, OL, Lapakahi, etc.) ===

export const mockPlantingSites: PlantingSite[] = [
  {
    id: 1,
    name: "Pu'u Wa'awa'a (PF)",
    location: "North Kona, Hawaii",
    area: "185 ha",
    zones: [
      { id: "pf-1", name: "Mauka Section", area: "65 ha" },
      { id: "pf-2", name: "Central Corridor", area: "70 ha" },
      { id: "pf-3", name: "Makai Slopes", area: "50 ha" },
    ],
  },
  {
    id: 2,
    name: "Mauna Medows (MM)",
    location: "Kohala, Hawaii",
    area: "120 ha",
    zones: [
      { id: "mm-1", name: "North Pasture", area: "45 ha" },
      { id: "mm-2", name: "South Pasture", area: "40 ha" },
      { id: "mm-3", name: "Gulch Restoration", area: "35 ha" },
    ],
  },
  {
    id: 3,
    name: "Ocean View Lands (OL)",
    location: "Ka'u, Hawaii",
    area: "210 ha",
    zones: [
      { id: "ol-1", name: "Phase 1 - East", area: "75 ha" },
      { id: "ol-2", name: "Phase 2 - West", area: "70 ha" },
      { id: "ol-3", name: "Phase 3 - Central", area: "65 ha" },
    ],
  },
  {
    id: 4,
    name: "Lapakahi",
    location: "North Kohala, Hawaii",
    area: "95 ha",
    zones: [
      { id: "lp-1", name: "Coastal Zone", area: "35 ha" },
      { id: "lp-2", name: "Upland Zone", area: "60 ha" },
    ],
  },
  {
    id: 5,
    name: "Kahua Ranch",
    location: "South Kohala, Hawaii",
    area: "150 ha",
    zones: [
      { id: "kr-1", name: "Windward Section", area: "55 ha" },
      { id: "kr-2", name: "Leeward Section", area: "50 ha" },
      { id: "kr-3", name: "Ridge Line", area: "45 ha" },
    ],
  },
];

// === Mock Planting Seasons ===

export const mockSeasons: PlantingSeason[] = [
  {
    id: "season-pf-2025",
    name: "2025-2026 Planting Season",
    startDate: new Date("2025-10-01"),
    endDate: new Date("2026-04-30"),
    siteId: 1,
  },
  {
    id: "season-mm-2025",
    name: "2025-2026 Planting Season",
    startDate: new Date("2025-11-01"),
    endDate: new Date("2026-03-31"),
    siteId: 2,
  },
  {
    id: "season-ol-2025",
    name: "2025-2026 Planting Season",
    startDate: new Date("2025-10-15"),
    endDate: new Date("2026-04-15"),
    siteId: 3,
  },
  {
    id: "season-lp-2025",
    name: "2025-2026 Planting Season",
    startDate: new Date("2025-11-01"),
    endDate: new Date("2026-02-28"),
    siteId: 4,
  },
  {
    id: "season-kr-2025",
    name: "2025-2026 Planting Season",
    startDate: new Date("2025-10-01"),
    endDate: new Date("2026-03-31"),
    siteId: 5,
  },
];

// === Mock Species Targets ===

export const mockSpeciesTargets: SpeciesTarget[] = [
  // Pu'u Wa'awa'a (PF) targets
  {
    id: "target-1",
    seasonId: "season-pf-2025",
    zoneId: "pf-1",
    speciesId: "sp-1",
    targetQuantity: 500,
  },
  {
    id: "target-2",
    seasonId: "season-pf-2025",
    zoneId: "pf-1",
    speciesId: "sp-4",
    targetQuantity: 200,
  },
  {
    id: "target-3",
    seasonId: "season-pf-2025",
    zoneId: "pf-1",
    speciesId: "sp-8",
    targetQuantity: 350,
  },
  {
    id: "target-4",
    seasonId: "season-pf-2025",
    zoneId: "pf-2",
    speciesId: "sp-1",
    targetQuantity: 400,
  },
  {
    id: "target-5",
    seasonId: "season-pf-2025",
    zoneId: "pf-2",
    speciesId: "sp-5",
    targetQuantity: 300,
  },
  {
    id: "target-6",
    seasonId: "season-pf-2025",
    zoneId: "pf-3",
    speciesId: "sp-3",
    targetQuantity: 600,
  },
  {
    id: "target-7",
    seasonId: "season-pf-2025",
    zoneId: "pf-3",
    speciesId: "sp-6",
    targetQuantity: 250,
  },

  // Mauna Medows (MM) targets
  {
    id: "target-8",
    seasonId: "season-mm-2025",
    zoneId: "mm-1",
    speciesId: "sp-8",
    targetQuantity: 450,
  },
  {
    id: "target-9",
    seasonId: "season-mm-2025",
    zoneId: "mm-1",
    speciesId: "sp-10",
    targetQuantity: 300,
  },
  {
    id: "target-10",
    seasonId: "season-mm-2025",
    zoneId: "mm-2",
    speciesId: "sp-9",
    targetQuantity: 200,
  },
  {
    id: "target-11",
    seasonId: "season-mm-2025",
    zoneId: "mm-3",
    speciesId: "sp-1",
    targetQuantity: 350,
  },
  {
    id: "target-12",
    seasonId: "season-mm-2025",
    zoneId: "mm-3",
    speciesId: "sp-11",
    targetQuantity: 200,
  },

  // Ocean View Lands (OL) targets
  {
    id: "target-13",
    seasonId: "season-ol-2025",
    zoneId: "ol-1",
    speciesId: "sp-1",
    targetQuantity: 800,
  },
  {
    id: "target-14",
    seasonId: "season-ol-2025",
    zoneId: "ol-1",
    speciesId: "sp-3",
    targetQuantity: 500,
  },
  {
    id: "target-15",
    seasonId: "season-ol-2025",
    zoneId: "ol-2",
    speciesId: "sp-4",
    targetQuantity: 250,
  },
  {
    id: "target-16",
    seasonId: "season-ol-2025",
    zoneId: "ol-2",
    speciesId: "sp-6",
    targetQuantity: 400,
  },

  // Lapakahi targets
  {
    id: "target-17",
    seasonId: "season-lp-2025",
    zoneId: "lp-1",
    speciesId: "sp-14",
    targetQuantity: 150,
  },
  {
    id: "target-18",
    seasonId: "season-lp-2025",
    zoneId: "lp-1",
    speciesId: "sp-15",
    targetQuantity: 100,
  },
  {
    id: "target-19",
    seasonId: "season-lp-2025",
    zoneId: "lp-2",
    speciesId: "sp-1",
    targetQuantity: 300,
  },

  // Kahua Ranch targets
  {
    id: "target-20",
    seasonId: "season-kr-2025",
    zoneId: "kr-1",
    speciesId: "sp-8",
    targetQuantity: 400,
  },
  {
    id: "target-21",
    seasonId: "season-kr-2025",
    zoneId: "kr-2",
    speciesId: "sp-10",
    targetQuantity: 350,
  },
  {
    id: "target-22",
    seasonId: "season-kr-2025",
    zoneId: "kr-3",
    speciesId: "sp-9",
    targetQuantity: 200,
  },
];

// === Mock Nursery Inventory ===

export const mockNurseryInventory: NurseryInventory[] = [
  // A'ali'i - plenty available
  { id: "inv-1", speciesId: "sp-1", availableQuantity: 1200, location: "Ready" },
  {
    id: "inv-2",
    speciesId: "sp-1",
    availableQuantity: 500,
    location: "Hardening",
  },
  {
    id: "inv-3",
    speciesId: "sp-1",
    availableQuantity: 800,
    location: "Greenhouse",
  },

  // 'Aweoweo
  { id: "inv-4", speciesId: "sp-2", availableQuantity: 300, location: "Ready" },
  {
    id: "inv-5",
    speciesId: "sp-2",
    availableQuantity: 200,
    location: "Greenhouse",
  },

  // Pili - good supply
  { id: "inv-6", speciesId: "sp-3", availableQuantity: 800, location: "Ready" },
  {
    id: "inv-7",
    speciesId: "sp-3",
    availableQuantity: 400,
    location: "Hardening",
  },

  // Wiliwili - limited
  { id: "inv-8", speciesId: "sp-4", availableQuantity: 150, location: "Ready" },
  {
    id: "inv-9",
    speciesId: "sp-4",
    availableQuantity: 200,
    location: "Greenhouse",
  },

  // Naio
  { id: "inv-10", speciesId: "sp-5", availableQuantity: 250, location: "Ready" },
  {
    id: "inv-11",
    speciesId: "sp-5",
    availableQuantity: 150,
    location: "Hardening",
  },

  // 'Ilima - good supply
  { id: "inv-12", speciesId: "sp-6", availableQuantity: 500, location: "Ready" },
  {
    id: "inv-13",
    speciesId: "sp-6",
    availableQuantity: 300,
    location: "Greenhouse",
  },

  // Ma'o - limited
  { id: "inv-14", speciesId: "sp-7", availableQuantity: 100, location: "Ready" },

  // Koa - moderate
  { id: "inv-15", speciesId: "sp-8", availableQuantity: 600, location: "Ready" },
  {
    id: "inv-16",
    speciesId: "sp-8",
    availableQuantity: 400,
    location: "Hardening",
  },
  {
    id: "inv-17",
    speciesId: "sp-8",
    availableQuantity: 500,
    location: "Greenhouse",
  },

  // 'Ohi'a Lehua - limited (difficult to propagate)
  { id: "inv-18", speciesId: "sp-9", availableQuantity: 200, location: "Ready" },
  {
    id: "inv-19",
    speciesId: "sp-9",
    availableQuantity: 150,
    location: "Hardening",
  },

  // Mamane
  {
    id: "inv-20",
    speciesId: "sp-10",
    availableQuantity: 400,
    location: "Ready",
  },
  {
    id: "inv-21",
    speciesId: "sp-10",
    availableQuantity: 300,
    location: "Greenhouse",
  },

  // Alahe'e
  {
    id: "inv-22",
    speciesId: "sp-11",
    availableQuantity: 180,
    location: "Ready",
  },
  {
    id: "inv-23",
    speciesId: "sp-11",
    availableQuantity: 120,
    location: "Hardening",
  },

  // Lama - limited
  { id: "inv-24", speciesId: "sp-12", availableQuantity: 80, location: "Ready" },

  // Koai'a
  {
    id: "inv-25",
    speciesId: "sp-13",
    availableQuantity: 150,
    location: "Ready",
  },

  // Milo
  {
    id: "inv-26",
    speciesId: "sp-14",
    availableQuantity: 200,
    location: "Ready",
  },

  // Kou
  {
    id: "inv-27",
    speciesId: "sp-15",
    availableQuantity: 120,
    location: "Ready",
  },
];

// === Mock Allocations ===

export const mockAllocations: Allocation[] = [
  // Some allocations already made for PF
  {
    id: "alloc-1",
    speciesId: "sp-1",
    quantity: 300,
    targetId: "target-1",
    status: "allocated",
    allocatedDate: new Date("2025-09-15"),
  },
  {
    id: "alloc-2",
    speciesId: "sp-4",
    quantity: 100,
    targetId: "target-2",
    status: "withdrawn",
    allocatedDate: new Date("2025-09-10"),
    withdrawnDate: new Date("2025-10-05"),
  },
  {
    id: "alloc-3",
    speciesId: "sp-8",
    quantity: 200,
    targetId: "target-3",
    status: "planted",
    allocatedDate: new Date("2025-09-01"),
    withdrawnDate: new Date("2025-10-01"),
  },

  // Some allocations for MM
  {
    id: "alloc-4",
    speciesId: "sp-8",
    quantity: 250,
    targetId: "target-8",
    status: "allocated",
    allocatedDate: new Date("2025-10-01"),
  },
  {
    id: "alloc-5",
    speciesId: "sp-10",
    quantity: 200,
    targetId: "target-9",
    status: "allocated",
    allocatedDate: new Date("2025-10-01"),
  },

  // Allocation for OL
  {
    id: "alloc-6",
    speciesId: "sp-1",
    quantity: 500,
    targetId: "target-13",
    status: "allocated",
    allocatedDate: new Date("2025-09-20"),
  },
];

// === Helper Functions ===

export function getSpeciesById(id: string): Species | undefined {
  return mockSpecies.find((s) => s.id === id);
}

export function getSiteById(id: number): PlantingSite | undefined {
  return mockPlantingSites.find((s) => s.id === id);
}

export function getSeasonById(id: string): PlantingSeason | undefined {
  return mockSeasons.find((s) => s.id === id);
}

export function getSeasonForSite(siteId: number): PlantingSeason | undefined {
  return mockSeasons.find((s) => s.siteId === siteId);
}

export function getTargetsForSeason(seasonId: string): SpeciesTarget[] {
  return mockSpeciesTargets.filter((t) => t.seasonId === seasonId);
}

export function getTargetsForZone(zoneId: string): SpeciesTarget[] {
  return mockSpeciesTargets.filter((t) => t.zoneId === zoneId);
}

export function getInventoryForSpecies(speciesId: string): NurseryInventory[] {
  return mockNurseryInventory.filter((i) => i.speciesId === speciesId);
}

export function getTotalInventoryForSpecies(speciesId: string): number {
  return mockNurseryInventory
    .filter((i) => i.speciesId === speciesId)
    .reduce((sum, i) => sum + i.availableQuantity, 0);
}

export function getReadyInventoryForSpecies(speciesId: string): number {
  return mockNurseryInventory
    .filter((i) => i.speciesId === speciesId && i.location === "Ready")
    .reduce((sum, i) => sum + i.availableQuantity, 0);
}

export function getAllocationsForTarget(targetId: string): Allocation[] {
  return mockAllocations.filter((a) => a.targetId === targetId);
}

export function getAllocatedQuantityForTarget(targetId: string): number {
  return mockAllocations
    .filter((a) => a.targetId === targetId)
    .reduce((sum, a) => sum + a.quantity, 0);
}

export function getTotalDemandForSpecies(speciesId: string): number {
  return mockSpeciesTargets
    .filter((t) => t.speciesId === speciesId)
    .reduce((sum, t) => sum + t.targetQuantity, 0);
}

export function getTotalAllocatedForSpecies(speciesId: string): number {
  return mockAllocations
    .filter((a) => a.speciesId === speciesId)
    .reduce((sum, a) => sum + a.quantity, 0);
}

// Get allocation status for a target
export type AllocationStatus = "fulfilled" | "partial" | "gap" | "unallocated";

export function getTargetAllocationStatus(target: SpeciesTarget): AllocationStatus {
  const allocated = getAllocatedQuantityForTarget(target.id);
  if (allocated === 0) return "unallocated";
  if (allocated >= target.targetQuantity) return "fulfilled";
  if (allocated > 0) return "partial";
  return "gap";
}

// Format date for display
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Format date range
export function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
  return `${startStr} - ${endStr}`;
}
