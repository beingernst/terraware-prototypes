/**
 * Mock data and types for the Nursery Inventory Planning page.
 */

export interface Species {
  id: string;
  scientificName: string;
  commonName: string;
}

export interface Nursery {
  id: string;
  name: string;
}

export interface PlantingSite {
  id: string;
  name: string;
}

export interface NurserySpeciesInventory {
  speciesId: string;
  nurseryId: string;
  quantity: number;
}

// --- Planting Seasons (each season belongs to one Planting Site) ---

export interface NurseryPlanningSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  siteId: string;
}

// --- Species × Season targets and allocations ---

export interface SiteSeasonTarget {
  speciesId: string;
  seasonId: string; // season already carries siteId
  target: number;
  allocated: number;
}

// --- Mock Data ---

export const species: Species[] = [
  { id: 'sp1', scientificName: 'Dodonaea viscosa', commonName: "A'ali'i" },
  { id: 'sp2', scientificName: 'Chenopodium oahuense', commonName: "'Aweoweo" },
  { id: 'sp3', scientificName: 'Heteropogon contortus', commonName: 'Pili' },
  { id: 'sp4', scientificName: 'Erythrina sandwicensis', commonName: 'Wiliwili' },
  { id: 'sp5', scientificName: 'Myoporum sandwicense', commonName: 'Naio' },
  { id: 'sp6', scientificName: 'Sida fallax', commonName: "'Ilima" },
  { id: 'sp7', scientificName: 'Gossypium tomentosum', commonName: "Ma'o" },
  { id: 'sp8', scientificName: 'Acacia koa', commonName: 'Koa' },
  { id: 'sp9', scientificName: 'Metrosideros polymorpha', commonName: "'Ohi'a Lehua" },
  { id: 'sp10', scientificName: 'Sophora chrysophylla', commonName: 'Mamane' },
];

export const nurseries: Nursery[] = [
  { id: 'n1', name: 'Waimea Nursery' },
  { id: 'n2', name: 'Kona Nursery' },
  { id: 'n3', name: 'Hilo Nursery' },
];

export const plantingSites: PlantingSite[] = [
  { id: 'ps1', name: "Pu'u Wa'awa'a" },
  { id: 'ps2', name: 'Mauna Meadows' },
  { id: 'ps3', name: 'Ocean View Lands' },
  { id: 'ps4', name: 'Lapakahi' },
  { id: 'ps5', name: 'Kahua Ranch' },
];

// Each Planting Site has its own seasons (different schedules per site).
// Seasons are sorted by startDate ascending.
export const nurseryPlanningSeasons: NurseryPlanningSeason[] = [
  // Pu'u Wa'awa'a (ps1) — 3 seasons
  { id: 'ps1-s1', name: 'Season 2024', startDate: '2024-02-01', endDate: '2024-10-31', siteId: 'ps1' },
  { id: 'ps1-s2', name: 'Season 2026', startDate: '2026-03-01', endDate: '2026-10-31', siteId: 'ps1' },
  { id: 'ps1-s3', name: 'Season 2027', startDate: '2027-02-01', endDate: '2027-10-31', siteId: 'ps1' },

  // Mauna Meadows (ps2) — 3 seasons
  { id: 'ps2-s1', name: 'Season 2025', startDate: '2025-04-01', endDate: '2025-11-30', siteId: 'ps2' },
  { id: 'ps2-s2', name: 'Season 2026', startDate: '2026-11-01', endDate: '2027-03-31', siteId: 'ps2' },
  { id: 'ps2-s3', name: 'Season 2027', startDate: '2027-11-01', endDate: '2028-03-31', siteId: 'ps2' },

  // Ocean View Lands (ps3) — 2 seasons
  { id: 'ps3-s1', name: 'Season 2025', startDate: '2025-06-01', endDate: '2025-12-31', siteId: 'ps3' },
  { id: 'ps3-s2', name: 'Season 2027', startDate: '2027-05-01', endDate: '2027-12-31', siteId: 'ps3' },

  // Lapakahi (ps4) — 2 seasons
  { id: 'ps4-s1', name: 'Season 2026', startDate: '2026-04-01', endDate: '2026-11-30', siteId: 'ps4' },
  { id: 'ps4-s2', name: 'Season 2027', startDate: '2027-04-01', endDate: '2027-11-30', siteId: 'ps4' },

  // Kahua Ranch (ps5) — 1 season
  { id: 'ps5-s1', name: 'Season 2027', startDate: '2027-03-01', endDate: '2027-10-31', siteId: 'ps5' },
];

// Species × Season targets and allocations.
// Past seasons (pre-2026) are fully allocated; active and future seasons are partially or unallocated.
export const siteSeasonTargets: SiteSeasonTarget[] = [
  // --- sp1 A'ali'i (inventory 600) ---
  { speciesId: 'sp1', seasonId: 'ps1-s1', target: 200, allocated: 200 }, // past — fulfilled
  { speciesId: 'sp1', seasonId: 'ps1-s2', target: 150, allocated: 120 },
  { speciesId: 'sp1', seasonId: 'ps1-s3', target: 180, allocated: 0 },
  { speciesId: 'sp1', seasonId: 'ps2-s1', target: 100, allocated: 100 }, // past — fulfilled
  { speciesId: 'sp1', seasonId: 'ps2-s2', target: 120, allocated: 80 },
  { speciesId: 'sp1', seasonId: 'ps4-s1', target: 50, allocated: 30 },

  // --- sp2 'Aweoweo (inventory 250) ---
  { speciesId: 'sp2', seasonId: 'ps1-s2', target: 150, allocated: 100 },
  { speciesId: 'sp2', seasonId: 'ps2-s2', target: 100, allocated: 60 },
  { speciesId: 'sp2', seasonId: 'ps3-s2', target: 80, allocated: 0 },
  { speciesId: 'sp2', seasonId: 'ps4-s1', target: 40, allocated: 20 },

  // --- sp3 Pili (inventory 80) ---
  { speciesId: 'sp3', seasonId: 'ps1-s2', target: 100, allocated: 30 },
  { speciesId: 'sp3', seasonId: 'ps1-s3', target: 120, allocated: 0 },
  { speciesId: 'sp3', seasonId: 'ps3-s1', target: 60, allocated: 40 }, // past
  { speciesId: 'sp3', seasonId: 'ps3-s2', target: 80, allocated: 0 },

  // --- sp4 Wiliwili (inventory 220) ---
  { speciesId: 'sp4', seasonId: 'ps1-s1', target: 80, allocated: 80 }, // past — fulfilled
  { speciesId: 'sp4', seasonId: 'ps1-s2', target: 60, allocated: 60 },
  { speciesId: 'sp4', seasonId: 'ps2-s1', target: 40, allocated: 40 }, // past — fulfilled
  { speciesId: 'sp4', seasonId: 'ps2-s2', target: 50, allocated: 0 },

  // --- sp5 Naio (inventory 180) ---
  { speciesId: 'sp5', seasonId: 'ps2-s2', target: 120, allocated: 80 },
  { speciesId: 'sp5', seasonId: 'ps3-s1', target: 60, allocated: 30 }, // past
  { speciesId: 'sp5', seasonId: 'ps5-s1', target: 100, allocated: 0 },

  // --- sp6 'Ilima (inventory 200) ---
  { speciesId: 'sp6', seasonId: 'ps1-s2', target: 60, allocated: 80 }, // over-allocated
  { speciesId: 'sp6', seasonId: 'ps2-s2', target: 40, allocated: 60 }, // over-allocated
  { speciesId: 'sp6', seasonId: 'ps4-s1', target: 20, allocated: 0 },

  // --- sp7 Ma'o (inventory 60) ---
  { speciesId: 'sp7', seasonId: 'ps1-s2', target: 100, allocated: 20 },
  { speciesId: 'sp7', seasonId: 'ps2-s2', target: 60, allocated: 15 },
  { speciesId: 'sp7', seasonId: 'ps3-s2', target: 40, allocated: 10 },
  { speciesId: 'sp7', seasonId: 'ps4-s1', target: 30, allocated: 10 },
  { speciesId: 'sp7', seasonId: 'ps5-s1', target: 20, allocated: 5 },

  // --- sp8 Koa (inventory 320) ---
  { speciesId: 'sp8', seasonId: 'ps1-s1', target: 150, allocated: 150 }, // past — fulfilled
  { speciesId: 'sp8', seasonId: 'ps1-s2', target: 100, allocated: 100 },
  { speciesId: 'sp8', seasonId: 'ps2-s1', target: 100, allocated: 100 }, // past — fulfilled
  { speciesId: 'sp8', seasonId: 'ps2-s2', target: 50, allocated: 0 },

  // --- sp9 'Ohi'a Lehua (inventory 350) ---
  { speciesId: 'sp9', seasonId: 'ps1-s2', target: 200, allocated: 100 },
  { speciesId: 'sp9', seasonId: 'ps2-s2', target: 120, allocated: 60 },
  { speciesId: 'sp9', seasonId: 'ps3-s2', target: 80, allocated: 30 },
  { speciesId: 'sp9', seasonId: 'ps4-s1', target: 50, allocated: 10 },
  { speciesId: 'sp9', seasonId: 'ps5-s1', target: 50, allocated: 0 },

  // --- sp10 Mamane (inventory 90) ---
  { speciesId: 'sp10', seasonId: 'ps1-s3', target: 60, allocated: 0 },
  { speciesId: 'sp10', seasonId: 'ps2-s3', target: 40, allocated: 0 },
  { speciesId: 'sp10', seasonId: 'ps3-s2', target: 30, allocated: 0 },
  { speciesId: 'sp10', seasonId: 'ps4-s2', target: 30, allocated: 0 },
  { speciesId: 'sp10', seasonId: 'ps5-s1', target: 20, allocated: 0 },
];

export const nurseryInventory: NurserySpeciesInventory[] = [
  // sp1 A'ali'i — 600 total
  { speciesId: 'sp1', nurseryId: 'n1', quantity: 300 },
  { speciesId: 'sp1', nurseryId: 'n2', quantity: 200 },
  { speciesId: 'sp1', nurseryId: 'n3', quantity: 100 },

  // sp2 'Aweoweo — 250 total
  { speciesId: 'sp2', nurseryId: 'n1', quantity: 120 },
  { speciesId: 'sp2', nurseryId: 'n2', quantity: 130 },

  // sp3 Pili — 80 total
  { speciesId: 'sp3', nurseryId: 'n1', quantity: 50 },
  { speciesId: 'sp3', nurseryId: 'n3', quantity: 30 },

  // sp4 Wiliwili — 220 total
  { speciesId: 'sp4', nurseryId: 'n1', quantity: 100 },
  { speciesId: 'sp4', nurseryId: 'n2', quantity: 70 },
  { speciesId: 'sp4', nurseryId: 'n3', quantity: 50 },

  // sp5 Naio — 180 total
  { speciesId: 'sp5', nurseryId: 'n2', quantity: 100 },
  { speciesId: 'sp5', nurseryId: 'n3', quantity: 80 },

  // sp6 'Ilima — 200 total
  { speciesId: 'sp6', nurseryId: 'n1', quantity: 120 },
  { speciesId: 'sp6', nurseryId: 'n2', quantity: 80 },

  // sp7 Ma'o — 60 total
  { speciesId: 'sp7', nurseryId: 'n3', quantity: 60 },

  // sp8 Koa — 320 total
  { speciesId: 'sp8', nurseryId: 'n1', quantity: 150 },
  { speciesId: 'sp8', nurseryId: 'n2', quantity: 100 },
  { speciesId: 'sp8', nurseryId: 'n3', quantity: 70 },

  // sp9 'Ohi'a Lehua — 350 total
  { speciesId: 'sp9', nurseryId: 'n1', quantity: 150 },
  { speciesId: 'sp9', nurseryId: 'n2', quantity: 120 },
  { speciesId: 'sp9', nurseryId: 'n3', quantity: 80 },

  // sp10 Mamane — 90 total
  { speciesId: 'sp10', nurseryId: 'n1', quantity: 50 },
  { speciesId: 'sp10', nurseryId: 'n2', quantity: 40 },
];

// --- Helpers ---

export function getSiteSeasonTargets(speciesId: string): SiteSeasonTarget[] {
  return siteSeasonTargets.filter((t) => t.speciesId === speciesId);
}

export function getSiteSeasonTarget(speciesId: string, seasonId: string): SiteSeasonTarget | undefined {
  return siteSeasonTargets.find((t) => t.speciesId === speciesId && t.seasonId === seasonId);
}

export function getNurseryInventoryForSpecies(speciesId: string): NurserySpeciesInventory[] {
  return nurseryInventory.filter((inv) => inv.speciesId === speciesId);
}

export function getTotalInventoryForSpecies(speciesId: string): number {
  return getNurseryInventoryForSpecies(speciesId).reduce((sum, inv) => sum + inv.quantity, 0);
}

export function getNurseryNamesForSpecies(speciesId: string): string[] {
  return getNurseryInventoryForSpecies(speciesId).map((inv) => {
    const nursery = nurseries.find((n) => n.id === inv.nurseryId);
    return nursery?.name ?? inv.nurseryId;
  });
}

/** Returns the site IDs that have a target > 0 for this species (across any season). */
export function getSiteIdsForSpecies(speciesId: string): string[] {
  const targets = getSiteSeasonTargets(speciesId).filter((t) => t.target > 0);
  const seasonIds = [...new Set(targets.map((t) => t.seasonId))];
  return [...new Set(
    seasonIds.map((sid) => nurseryPlanningSeasons.find((s) => s.id === sid)?.siteId).filter(Boolean) as string[]
  )];
}
