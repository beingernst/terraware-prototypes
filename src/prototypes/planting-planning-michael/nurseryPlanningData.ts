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

export interface NeedByDate {
  id: string;
  label: string;
}

export interface SiteAllocation {
  speciesId: string;
  siteId: string;
  allocated: number;
  target: number;
}

export interface NurserySpeciesInventory {
  speciesId: string;
  nurseryId: string;
  quantity: number;
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

export const needByDates: NeedByDate[] = [
  { id: 'nbd1', label: 'Mar 15, 2026' },
  { id: 'nbd2', label: 'Jun 1, 2026' },
  { id: 'nbd3', label: 'Nov 1, 2026' },
];

export const initialSiteAllocations: SiteAllocation[] = [
  // sp1 A'ali'i — fulfilled (total target 500, inventory 600)
  { speciesId: 'sp1', siteId: 'ps1', allocated: 200, target: 200 },
  { speciesId: 'sp1', siteId: 'ps2', allocated: 150, target: 150 },
  { speciesId: 'sp1', siteId: 'ps3', allocated: 100, target: 100 },
  { speciesId: 'sp1', siteId: 'ps4', allocated: 50, target: 50 },
  { speciesId: 'sp1', siteId: 'ps5', allocated: 0, target: 0 },

  // sp2 'Aweoweo — partial (target 400, inventory 250)
  { speciesId: 'sp2', siteId: 'ps1', allocated: 100, target: 150 },
  { speciesId: 'sp2', siteId: 'ps2', allocated: 80, target: 100 },
  { speciesId: 'sp2', siteId: 'ps3', allocated: 50, target: 80 },
  { speciesId: 'sp2', siteId: 'ps4', allocated: 20, target: 40 },
  { speciesId: 'sp2', siteId: 'ps5', allocated: 0, target: 30 },

  // sp3 Pili — gap (target 300, inventory 80)
  { speciesId: 'sp3', siteId: 'ps1', allocated: 30, target: 100 },
  { speciesId: 'sp3', siteId: 'ps2', allocated: 20, target: 80 },
  { speciesId: 'sp3', siteId: 'ps3', allocated: 15, target: 60 },
  { speciesId: 'sp3', siteId: 'ps4', allocated: 10, target: 40 },
  { speciesId: 'sp3', siteId: 'ps5', allocated: 5, target: 20 },

  // sp4 Wiliwili — fulfilled
  { speciesId: 'sp4', siteId: 'ps1', allocated: 80, target: 80 },
  { speciesId: 'sp4', siteId: 'ps2', allocated: 60, target: 60 },
  { speciesId: 'sp4', siteId: 'ps3', allocated: 40, target: 40 },
  { speciesId: 'sp4', siteId: 'ps4', allocated: 20, target: 20 },
  { speciesId: 'sp4', siteId: 'ps5', allocated: 0, target: 0 },

  // sp5 Naio — partial
  { speciesId: 'sp5', siteId: 'ps1', allocated: 60, target: 120 },
  { speciesId: 'sp5', siteId: 'ps2', allocated: 40, target: 80 },
  { speciesId: 'sp5', siteId: 'ps3', allocated: 30, target: 60 },
  { speciesId: 'sp5', siteId: 'ps4', allocated: 0, target: 30 },
  { speciesId: 'sp5', siteId: 'ps5', allocated: 0, target: 10 },

  // sp6 'Ilima — over-allocated (target 150, inventory 200, allocated 180)
  { speciesId: 'sp6', siteId: 'ps1', allocated: 80, target: 60 },
  { speciesId: 'sp6', siteId: 'ps2', allocated: 60, target: 40 },
  { speciesId: 'sp6', siteId: 'ps3', allocated: 40, target: 30 },
  { speciesId: 'sp6', siteId: 'ps4', allocated: 0, target: 20 },
  { speciesId: 'sp6', siteId: 'ps5', allocated: 0, target: 0 },

  // sp7 Ma'o — gap (target 250, inventory 60)
  { speciesId: 'sp7', siteId: 'ps1', allocated: 20, target: 100 },
  { speciesId: 'sp7', siteId: 'ps2', allocated: 15, target: 60 },
  { speciesId: 'sp7', siteId: 'ps3', allocated: 10, target: 40 },
  { speciesId: 'sp7', siteId: 'ps4', allocated: 10, target: 30 },
  { speciesId: 'sp7', siteId: 'ps5', allocated: 5, target: 20 },

  // sp8 Koa — fulfilled
  { speciesId: 'sp8', siteId: 'ps1', allocated: 150, target: 150 },
  { speciesId: 'sp8', siteId: 'ps2', allocated: 100, target: 100 },
  { speciesId: 'sp8', siteId: 'ps3', allocated: 50, target: 50 },
  { speciesId: 'sp8', siteId: 'ps4', allocated: 0, target: 0 },
  { speciesId: 'sp8', siteId: 'ps5', allocated: 0, target: 0 },

  // sp9 'Ohi'a Lehua — partial
  { speciesId: 'sp9', siteId: 'ps1', allocated: 100, target: 200 },
  { speciesId: 'sp9', siteId: 'ps2', allocated: 60, target: 120 },
  { speciesId: 'sp9', siteId: 'ps3', allocated: 30, target: 80 },
  { speciesId: 'sp9', siteId: 'ps4', allocated: 10, target: 50 },
  { speciesId: 'sp9', siteId: 'ps5', allocated: 0, target: 50 },

  // sp10 Mamane — zero allocation (target 180, inventory 90)
  { speciesId: 'sp10', siteId: 'ps1', allocated: 0, target: 60 },
  { speciesId: 'sp10', siteId: 'ps2', allocated: 0, target: 40 },
  { speciesId: 'sp10', siteId: 'ps3', allocated: 0, target: 30 },
  { speciesId: 'sp10', siteId: 'ps4', allocated: 0, target: 30 },
  { speciesId: 'sp10', siteId: 'ps5', allocated: 0, target: 20 },
];

export const nurseryInventory: NurserySpeciesInventory[] = [
  // sp1 A'ali'i — 600 total (fulfilled)
  { speciesId: 'sp1', nurseryId: 'n1', quantity: 300 },
  { speciesId: 'sp1', nurseryId: 'n2', quantity: 200 },
  { speciesId: 'sp1', nurseryId: 'n3', quantity: 100 },

  // sp2 'Aweoweo — 250 total (partial, target 400)
  { speciesId: 'sp2', nurseryId: 'n1', quantity: 120 },
  { speciesId: 'sp2', nurseryId: 'n2', quantity: 130 },

  // sp3 Pili — 80 total (gap, target 300)
  { speciesId: 'sp3', nurseryId: 'n1', quantity: 50 },
  { speciesId: 'sp3', nurseryId: 'n3', quantity: 30 },

  // sp4 Wiliwili — 220 total (fulfilled, target 200)
  { speciesId: 'sp4', nurseryId: 'n1', quantity: 100 },
  { speciesId: 'sp4', nurseryId: 'n2', quantity: 70 },
  { speciesId: 'sp4', nurseryId: 'n3', quantity: 50 },

  // sp5 Naio — 180 total (partial, target 300)
  { speciesId: 'sp5', nurseryId: 'n2', quantity: 100 },
  { speciesId: 'sp5', nurseryId: 'n3', quantity: 80 },

  // sp6 'Ilima — 200 total (over-allocated at 180, target 150)
  { speciesId: 'sp6', nurseryId: 'n1', quantity: 120 },
  { speciesId: 'sp6', nurseryId: 'n2', quantity: 80 },

  // sp7 Ma'o — 60 total (gap, target 250)
  { speciesId: 'sp7', nurseryId: 'n3', quantity: 60 },

  // sp8 Koa — 320 total (fulfilled, target 300)
  { speciesId: 'sp8', nurseryId: 'n1', quantity: 150 },
  { speciesId: 'sp8', nurseryId: 'n2', quantity: 100 },
  { speciesId: 'sp8', nurseryId: 'n3', quantity: 70 },

  // sp9 'Ohi'a Lehua — 350 total (partial, target 500)
  { speciesId: 'sp9', nurseryId: 'n1', quantity: 150 },
  { speciesId: 'sp9', nurseryId: 'n2', quantity: 120 },
  { speciesId: 'sp9', nurseryId: 'n3', quantity: 80 },

  // sp10 Mamane — 90 total (zero allocated, target 180)
  { speciesId: 'sp10', nurseryId: 'n1', quantity: 50 },
  { speciesId: 'sp10', nurseryId: 'n2', quantity: 40 },
];

// --- Planting Seasons (for nursery planning detail panel) ---

export interface NurseryPlanningSeason {
  id: string;
  name: string;
  startDate: string;
}

export const nurseryPlanningSeasons: NurseryPlanningSeason[] = [
  { id: 'season-2024',   name: 'Feb - Nov 2024',    startDate: '2024-02-01' },
  { id: 'season-active', name: 'Mar - Oct 2026',    startDate: '2026-03-01' },
  { id: 'season-future', name: 'Nov - Mar 2026-27', startDate: '2026-11-12' },
];

export interface SeasonAllocation {
  speciesId: string;
  seasonId: string;
  allocated: number;
  target: number;
}

export const initialSeasonAllocations: SeasonAllocation[] = [
  // sp1 A'ali'i
  { speciesId: 'sp1', seasonId: 'season-active', allocated: 300, target: 300 },
  { speciesId: 'sp1', seasonId: 'season-future', allocated: 200, target: 200 },
  // sp2 'Aweoweo
  { speciesId: 'sp2', seasonId: 'season-active', allocated: 150, target: 250 },
  { speciesId: 'sp2', seasonId: 'season-future', allocated: 100, target: 150 },
  // sp3 Pili
  { speciesId: 'sp3', seasonId: 'season-active', allocated: 60, target: 200 },
  { speciesId: 'sp3', seasonId: 'season-future', allocated: 20, target: 100 },
  // sp4 Wiliwili
  { speciesId: 'sp4', seasonId: 'season-active', allocated: 150, target: 150 },
  { speciesId: 'sp4', seasonId: 'season-future', allocated: 50, target: 50 },
  // sp5 Naio
  { speciesId: 'sp5', seasonId: 'season-active', allocated: 100, target: 180 },
  { speciesId: 'sp5', seasonId: 'season-future', allocated: 30, target: 120 },
  // sp6 'Ilima
  { speciesId: 'sp6', seasonId: 'season-active', allocated: 120, target: 100 },
  { speciesId: 'sp6', seasonId: 'season-future', allocated: 60, target: 50 },
  // sp7 Ma'o
  { speciesId: 'sp7', seasonId: 'season-active', allocated: 40, target: 150 },
  { speciesId: 'sp7', seasonId: 'season-future', allocated: 20, target: 100 },
  // sp8 Koa
  { speciesId: 'sp8', seasonId: 'season-active', allocated: 200, target: 200 },
  { speciesId: 'sp8', seasonId: 'season-future', allocated: 100, target: 100 },
  // sp9 'Ohi'a Lehua
  { speciesId: 'sp9', seasonId: 'season-active', allocated: 150, target: 300 },
  { speciesId: 'sp9', seasonId: 'season-future', allocated: 50, target: 200 },
  // sp10 Mamane
  { speciesId: 'sp10', seasonId: 'season-active', allocated: 0, target: 100 },
  { speciesId: 'sp10', seasonId: 'season-future', allocated: 0, target: 80 },
];

export function getSeasonAllocationsForSpecies(speciesId: string): SeasonAllocation[] {
  return initialSeasonAllocations.filter((a) => a.speciesId === speciesId);
}

// --- Helpers ---

export function getSpeciesById(id: string): Species | undefined {
  return species.find((s) => s.id === id);
}

export function getAllocationsForSpecies(
  allAllocations: SiteAllocation[],
  speciesId: string
): SiteAllocation[] {
  return allAllocations.filter((a) => a.speciesId === speciesId);
}

export function getNurseryInventoryForSpecies(speciesId: string): NurserySpeciesInventory[] {
  return nurseryInventory.filter((inv) => inv.speciesId === speciesId);
}

export function getTotalInventoryForSpecies(speciesId: string): number {
  return getNurseryInventoryForSpecies(speciesId).reduce((sum, inv) => sum + inv.quantity, 0);
}

export function getNurseryNamesForSpecies(speciesId: string): string[] {
  const invItems = getNurseryInventoryForSpecies(speciesId);
  return invItems.map((inv) => {
    const nursery = nurseries.find((n) => n.id === inv.nurseryId);
    return nursery?.name ?? inv.nurseryId;
  });
}

export function hasInventoryGap(
  allAllocations: SiteAllocation[],
  speciesId: string
): boolean {
  const totalTarget = getAllocationsForSpecies(allAllocations, speciesId).reduce(
    (sum, a) => sum + a.target,
    0
  );
  const totalInventory = getTotalInventoryForSpecies(speciesId);
  return totalInventory < totalTarget;
}
