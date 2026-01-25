import { useState, useMemo, useCallback } from "react";
import { Page } from "@/components/layout";
import { Card } from "@/components/core";
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Collapse,
  Modal,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Button } from "@terraware/web-components";
import {
  LocationOn as LocationIcon,
  KeyboardArrowDown,
  KeyboardArrowRight,
  GridView as ZoneIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Colors
const HEADER_BG = "#F5F5F0";
const SITE_BAR_BG = "#4A7C59"; // Darker green for site aggregate (FLIPPED)
const ZONE_BAR_BG = "#7DA88A"; // Lighter green for zone bars (FLIPPED)
const ZONE_BAR_HOVER = "#6B9A7A";
const BORDER_COLOR = "#E8E5E0";
const SITE_BORDER_COLOR = "#C8C5C0"; // Darker border between sites
const TEXT_PRIMARY = "#3A4445";
const TEXT_SECONDARY = "#6B7165";
const ZONE_ROW_BG = "#FAFAFA";
const ZONE_HIGHLIGHT = "#4A7C59"; // For highlighted zone on map
const WET_SEASON_BG = "rgba(181, 212, 232, 0.15)"; // Very subtle blue shading for wet season (site rows)
const WET_SEASON_ZONE_BG = "rgba(181, 212, 232, 0.08)"; // More desaturated blue for wet season (zone rows)

// Sticky header styling
const STICKY_HEADER_BG = "rgb(249, 248, 247)"; // Match page background

// Zone colors for map visualization
const ZONE_MAP_COLORS = [
  "#B8D4C8", // Light sage
  "#D4C8B8", // Light tan
  "#C8D4B8", // Light lime
  "#C8B8D4", // Light lavender
  "#D4B8C8", // Light rose
];

// Months for the Gantt chart
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_NAMES_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Default years for planning
const DEFAULT_YEARS = [2025, 2026, 2027, 2028];

// Species type for species planning
interface Species {
  id: string;
  commonName: string;
  scientificName: string;
}

// Mock available species list
const availableSpecies: Species[] = [
  { id: "sp-1", commonName: "Teak", scientificName: "Tectona grandis" },
  { id: "sp-2", commonName: "Mahogany", scientificName: "Swietenia macrophylla" },
  { id: "sp-3", commonName: "Jackfruit", scientificName: "Artocarpus heterophyllus" },
  { id: "sp-4", commonName: "Durian", scientificName: "Durio zibethinus" },
  { id: "sp-5", commonName: "Mango", scientificName: "Mangifera indica" },
  { id: "sp-6", commonName: "Rambutan", scientificName: "Nephelium lappaceum" },
  { id: "sp-7", commonName: "Mangosteen", scientificName: "Garcinia mangostana" },
  { id: "sp-8", commonName: "Coconut Palm", scientificName: "Cocos nucifera" },
  { id: "sp-9", commonName: "Bamboo", scientificName: "Bambusa vulgaris" },
  { id: "sp-10", commonName: "Banyan", scientificName: "Ficus benghalensis" },
];

// Species assignment for a zone
interface SpeciesAssignment {
  speciesId: string;
  quantity: number;
}

// Species assignments per zone: zoneId -> assignments[]
type SpeciesSchedule = Record<string, SpeciesAssignment[]>;

// Initial mock species assignments
function createInitialSpeciesSchedule(): SpeciesSchedule {
  return {
    "1-a": [
      { speciesId: "sp-1", quantity: 500 },
      { speciesId: "sp-2", quantity: 300 },
      { speciesId: "sp-5", quantity: 200 },
    ],
    "1-b": [
      { speciesId: "sp-1", quantity: 400 },
      { speciesId: "sp-3", quantity: 250 },
    ],
    "1-c": [
      { speciesId: "sp-8", quantity: 150 },
      { speciesId: "sp-9", quantity: 500 },
    ],
    "2-a": [
      { speciesId: "sp-2", quantity: 600 },
      { speciesId: "sp-4", quantity: 200 },
    ],
    "2-b": [
      { speciesId: "sp-1", quantity: 350 },
    ],
    "site-3": [
      { speciesId: "sp-1", quantity: 1000 },
      { speciesId: "sp-2", quantity: 800 },
      { speciesId: "sp-10", quantity: 400 },
    ],
    "4-a": [
      { speciesId: "sp-8", quantity: 300 },
    ],
    "4-b": [
      { speciesId: "sp-8", quantity: 200 },
      { speciesId: "sp-9", quantity: 350 },
    ],
  };
}

// Zone type
interface Zone {
  id: string;
  name: string;
  area: string;
}

// Site type with zones
interface PlantingSite {
  id: number;
  name: string;
  location: string;
  area: string;
  zones: Zone[];
  // Wet season months (0-11) - set by user on another page
  wetSeasonMonths: Set<number>;
}

// Mock planting sites data with zones
// Wet season months vary by location (set by user on another page)
const mockPlantingSites: PlantingSite[] = [
  {
    id: 1,
    name: "Site 83",
    location: "West Java, Indonesia",
    area: "227 ha",
    zones: [
      { id: "1-a", name: "Zone A - Hillside", area: "85 ha" },
      { id: "1-b", name: "Zone B - Valley", area: "72 ha" },
      { id: "1-c", name: "Zone C - Riverside", area: "70 ha" },
    ],
    wetSeasonMonths: new Set([0, 1, 2, 10, 11]), // Nov-Mar
  },
  {
    id: 2,
    name: "Site 84",
    location: "Central Java, Indonesia",
    area: "185 ha",
    zones: [
      { id: "2-a", name: "Zone A - North Section", area: "95 ha" },
      { id: "2-b", name: "Zone B - South Section", area: "90 ha" },
    ],
    wetSeasonMonths: new Set([0, 1, 2, 10, 11]), // Nov-Mar
  },
  {
    id: 3,
    name: "Northern Reserve",
    location: "East Java, Indonesia",
    area: "312 ha",
    zones: [],
    wetSeasonMonths: new Set([0, 1, 2, 11]), // Dec-Mar
  },
  {
    id: 4,
    name: "Coastal Restoration",
    location: "Bali, Indonesia",
    area: "98 ha",
    zones: [
      { id: "4-a", name: "Zone A - Beach Front", area: "45 ha" },
      { id: "4-b", name: "Zone B - Mangrove Area", area: "53 ha" },
    ],
    wetSeasonMonths: new Set([0, 1, 2, 3, 10, 11]), // Nov-Apr (longer wet season)
  },
  {
    id: 5,
    name: "Highland Project",
    location: "Sumatra, Indonesia",
    area: "456 ha",
    zones: [
      { id: "5-a", name: "Zone A - Upper Slopes", area: "180 ha" },
      { id: "5-b", name: "Zone B - Mid Elevation", area: "156 ha" },
      { id: "5-c", name: "Zone C - Lower Terraces", area: "120 ha" },
    ],
    wetSeasonMonths: new Set([0, 1, 2, 3, 9, 10, 11]), // Oct-Apr (highland pattern)
  },
];

// Type for tracking selected months per zone per year
// Structure: { year: { zoneId: Set<monthIndex> } }
type PlantingSchedule = Record<number, Record<string, Set<number>>>;


// Helper to format consecutive months as ranges
function formatMonthRanges(monthIndices: number[]): string {
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
      } else {
        ranges.push(
          `${MONTH_NAMES_FULL[rangeStart]} through ${MONTH_NAMES_FULL[rangeEnd]}`,
        );
      }
      if (i < sorted.length) {
        rangeStart = sorted[i];
        rangeEnd = sorted[i];
      }
    }
  }

  return ranges.join(", ");
}

// Helper to get the editable ID for a site (for sites with 0-1 zones)
function getSiteEditableId(site: PlantingSite): string {
  if (site.zones.length === 1) {
    return site.zones[0].id;
  }
  return `site-${site.id}`;
}

// Helper to create initial schedule data
function createInitialSchedule(years: number[]): PlantingSchedule {
  const initial: PlantingSchedule = {};
  years.forEach((year) => {
    initial[year] = {};
    mockPlantingSites.forEach((site) => {
      if (site.zones.length === 0) {
        // Sites with no zones get a site-level entry
        initial[year][`site-${site.id}`] = new Set<number>();
      } else {
        site.zones.forEach((zone) => {
          initial[year][zone.id] = new Set<number>();
        });
      }
    });
  });
  // Pre-select some months for demo (2025)
  if (initial[2025]) {
    initial[2025]["1-a"] = new Set([2, 3, 4]); // Site 83, Zone A: Mar-May
    initial[2025]["1-b"] = new Set([3, 4, 5]); // Site 83, Zone B: Apr-Jun
    initial[2025]["1-c"] = new Set([4, 5]); // Site 83, Zone C: May-Jun
    initial[2025]["2-a"] = new Set([9, 10, 11]); // Site 84, Zone A: Oct-Dec
    initial[2025]["2-b"] = new Set([10, 11]); // Site 84, Zone B: Nov-Dec
    initial[2025]["site-3"] = new Set([3, 4, 5, 6]); // Northern Reserve (no zones): Apr-Jul
  }
  // Some 2026 data
  if (initial[2026]) {
    initial[2026]["1-a"] = new Set([1, 2, 3]); // Site 83, Zone A: Feb-Apr
    initial[2026]["1-b"] = new Set([7, 8, 9]); // Site 83, Zone B: Aug-Oct
    initial[2026]["4-a"] = new Set([4, 5]); // Coastal, Zone A: May-Jun
  }
  return initial;
}

// Helper to add a year to schedule
function addYearToSchedule(schedule: PlantingSchedule, year: number): PlantingSchedule {
  if (schedule[year]) return schedule; // Already exists
  const updated = { ...schedule };
  updated[year] = {};
  mockPlantingSites.forEach((site) => {
    if (site.zones.length === 0) {
      updated[year][`site-${site.id}`] = new Set<number>();
    } else {
      site.zones.forEach((zone) => {
        updated[year][zone.id] = new Set<number>();
      });
    }
  });
  return updated;
}

// Helper to remove a year from schedule
function removeYearFromSchedule(schedule: PlantingSchedule, year: number): PlantingSchedule {
  const updated = { ...schedule };
  delete updated[year];
  return updated;
}

// Helper to deep clone schedule (for comparison)
function cloneSchedule(schedule: PlantingSchedule): PlantingSchedule {
  const cloned: PlantingSchedule = {};
  Object.keys(schedule).forEach((yearStr) => {
    const year = parseInt(yearStr);
    cloned[year] = {};
    Object.keys(schedule[year]).forEach((zoneId) => {
      cloned[year][zoneId] = new Set(schedule[year][zoneId]);
    });
  });
  return cloned;
}

// Helper to compare two schedules
function schedulesEqual(a: PlantingSchedule, b: PlantingSchedule): boolean {
  const yearsA = Object.keys(a);
  const yearsB = Object.keys(b);
  if (yearsA.length !== yearsB.length) return false;

  for (const yearStr of yearsA) {
    const year = parseInt(yearStr);
    const zonesA = Object.keys(a[year]);
    const zonesB = Object.keys(b[year] || {});
    if (zonesA.length !== zonesB.length) return false;

    for (const zoneId of zonesA) {
      const setA = a[year][zoneId];
      const setB = b[year]?.[zoneId];
      if (!setB || setA.size !== setB.size) return false;
      for (const month of setA) {
        if (!setB.has(month)) return false;
      }
    }
  }
  return true;
}


// View options for the planting plan
type PlanView = "overview" | "schedule" | "species";
const VIEW_LABELS: Record<PlanView, string> = {
  overview: "Overview",
  schedule: "Schedule",
  species: "Species",
};

// Order for dropdown menu
const VIEW_ORDER: PlanView[] = ["overview", "schedule", "species"];

// Species table component for a zone
interface SpeciesTableProps {
  zoneId: string;
  assignments: SpeciesAssignment[];
  unassignedSpecies: Species[];
  getSpeciesName: (id: string) => string;
  getSpeciesScientificName: (id: string) => string;
  onAddSpecies: (speciesId: string) => void;
  onUpdateQuantity: (speciesId: string, quantity: number) => void;
  onRemoveSpecies: (speciesId: string) => void;
  totalPlants: number;
}

function SpeciesTable({
  assignments,
  unassignedSpecies,
  getSpeciesName,
  getSpeciesScientificName,
  onAddSpecies,
  onUpdateQuantity,
  onRemoveSpecies,
}: SpeciesTableProps) {
  const [addingSpecies, setAddingSpecies] = useState(false);
  const [selectedSpeciesToAdd, setSelectedSpeciesToAdd] = useState("");

  const handleAddClick = () => {
    if (selectedSpeciesToAdd) {
      onAddSpecies(selectedSpeciesToAdd);
      setSelectedSpeciesToAdd("");
      setAddingSpecies(false);
    }
  };

  return (
    <Box>
      {/* Species list */}
      {assignments.length > 0 ? (
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "12px",
                  color: TEXT_SECONDARY,
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                  py: 1,
                }}
              >
                Species
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 500,
                  fontSize: "12px",
                  color: TEXT_SECONDARY,
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                  py: 1,
                  width: 150,
                }}
              >
                Quantity
              </TableCell>
              <TableCell
                sx={{
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                  py: 1,
                  width: 50,
                }}
              />
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map((assignment) => (
              <TableRow key={assignment.speciesId}>
                <TableCell
                  sx={{
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                    py: 1.5,
                  }}
                >
                  <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY }}>
                    {getSpeciesName(assignment.speciesId)}
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: TEXT_SECONDARY, fontStyle: "italic" }}>
                    {getSpeciesScientificName(assignment.speciesId)}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                    py: 1.5,
                  }}
                >
                  <TextField
                    type="number"
                    value={assignment.quantity}
                    onChange={(e) =>
                      onUpdateQuantity(
                        assignment.speciesId,
                        parseInt(e.target.value) || 0
                      )
                    }
                    size="small"
                    sx={{
                      width: 100,
                      "& .MuiOutlinedInput-root": {
                        fontSize: "13px",
                      },
                      "& input": {
                        py: 0.75,
                        px: 1,
                      },
                    }}
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                    py: 1.5,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => onRemoveSpecies(assignment.speciesId)}
                    sx={{ color: TEXT_SECONDARY, "&:hover": { color: "#D32F2F" } }}
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Box
          sx={{
            p: 2,
            backgroundColor: "rgba(0,0,0,0.02)",
            borderRadius: "6px",
            textAlign: "center",
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY, fontStyle: "italic" }}>
            No species assigned yet
          </Typography>
        </Box>
      )}

      {/* Add species controls */}
      {addingSpecies ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ fontSize: "13px" }}>Select species</InputLabel>
            <Select
              value={selectedSpeciesToAdd}
              onChange={(e) => setSelectedSpeciesToAdd(e.target.value)}
              label="Select species"
              sx={{ fontSize: "13px" }}
            >
              {unassignedSpecies.map((species) => (
                <MenuItem key={species.id} value={species.id} sx={{ fontSize: "13px" }}>
                  {species.commonName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            label="Add"
            onClick={handleAddClick}
            disabled={!selectedSpeciesToAdd}
            type="productive"
            priority="secondary"
            size="small"
          />
          <Button
            label="Cancel"
            onClick={() => {
              setAddingSpecies(false);
              setSelectedSpeciesToAdd("");
            }}
            type="passive"
            priority="secondary"
            size="small"
          />
        </Box>
      ) : (
        <Box>
          {unassignedSpecies.length > 0 ? (
            <Button
              label="+ Add Species"
              onClick={() => setAddingSpecies(true)}
              type="productive"
              priority="secondary"
              size="small"
            />
          ) : (
            <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY, fontStyle: "italic" }}>
              All available species have been assigned
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

export function PlanningHome() {
  // Current view
  const [currentView, setCurrentView] = useState<PlanView>("schedule");
  const [viewMenuAnchor, setViewMenuAnchor] = useState<null | HTMLElement>(null);
  const viewMenuOpen = Boolean(viewMenuAnchor);

  // Species schedule state
  const [speciesSchedule, setSpeciesSchedule] = useState<SpeciesSchedule>(() =>
    createInitialSpeciesSchedule()
  );

  // Track which sites are expanded in species view
  const [expandedSpeciesSites, setExpandedSpeciesSites] = useState<Set<number>>(
    new Set([1])
  );

  // Available years (can be modified)
  const [years, setYears] = useState<number[]>(DEFAULT_YEARS);

  // Currently selected year
  const [selectedYear, setSelectedYear] = useState(2025);

  // Track which sites are expanded
  const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set([1])); // Start with Site 83 expanded

  // Store the initial/saved schedule state
  const [savedSchedule, setSavedSchedule] = useState<PlantingSchedule>(() =>
    createInitialSchedule(DEFAULT_YEARS),
  );

  // Track which months are selected for each zone per year (working copy)
  const [schedule, setSchedule] = useState<PlantingSchedule>(() =>
    cloneSchedule(savedSchedule),
  );

  // State for delete confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<number | null>(null);

  // Check if a year has any data
  const yearHasData = useCallback((year: number): boolean => {
    const yearSchedule = schedule[year];
    if (!yearSchedule) return false;
    return Object.values(yearSchedule).some((months) => months.size > 0);
  }, [schedule]);

  // Add a new year
  const handleAddYear = useCallback(() => {
    const maxYear = Math.max(...years);
    const newYear = maxYear + 1;
    setYears((prev) => [...prev, newYear]);
    setSchedule((prev) => addYearToSchedule(prev, newYear));
    setSavedSchedule((prev) => addYearToSchedule(prev, newYear));
  }, [years]);

  // Initiate year removal (always removes the most recent/youngest year)
  const handleRemoveYearClick = useCallback(() => {
    if (years.length <= 1) return; // Don't remove the last year
    const youngestYear = Math.max(...years);
    if (yearHasData(youngestYear)) {
      // Show confirmation modal
      setYearToDelete(youngestYear);
      setDeleteConfirmOpen(true);
    } else {
      // Delete directly
      removeYear(youngestYear);
    }
  }, [years, yearHasData]);

  // Actually remove the year
  const removeYear = useCallback((yearToRemove: number) => {
    setYears((prev) => prev.filter((y) => y !== yearToRemove));
    setSchedule((prev) => removeYearFromSchedule(prev, yearToRemove));
    setSavedSchedule((prev) => removeYearFromSchedule(prev, yearToRemove));
    // If we're removing the selected year, select another one
    if (selectedYear === yearToRemove) {
      const remaining = years.filter((y) => y !== yearToRemove);
      setSelectedYear(remaining[0]);
    }
  }, [years, selectedYear]);

  // Confirm deletion
  const handleConfirmDelete = useCallback(() => {
    if (yearToDelete !== null) {
      removeYear(yearToDelete);
    }
    setDeleteConfirmOpen(false);
    setYearToDelete(null);
  }, [yearToDelete, removeYear]);

  // Cancel deletion
  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmOpen(false);
    setYearToDelete(null);
  }, []);

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return !schedulesEqual(schedule, savedSchedule);
  }, [schedule, savedSchedule]);

  // Save changes
  const handleSave = useCallback(() => {
    setSavedSchedule(cloneSchedule(schedule));
    // In a real app, this would also persist to the server
  }, [schedule]);

  // Discard changes
  const handleDiscard = useCallback(() => {
    setSchedule(cloneSchedule(savedSchedule));
  }, [savedSchedule]);

  // Zone map modal state
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [selectedZoneForMap, setSelectedZoneForMap] = useState<{
    site: PlantingSite;
    zone: Zone;
  } | null>(null);

  // Open zone map modal
  const openZoneMap = (site: PlantingSite, zone: Zone) => {
    setSelectedZoneForMap({ site, zone });
    setZoneModalOpen(true);
  };

  // Close zone map modal
  const closeZoneMap = () => {
    setZoneModalOpen(false);
    setSelectedZoneForMap(null);
  };

  // Toggle site expansion
  const toggleSiteExpanded = (siteId: number) => {
    setExpandedSites((prev) => {
      const next = new Set(prev);
      if (next.has(siteId)) {
        next.delete(siteId);
      } else {
        next.add(siteId);
      }
      return next;
    });
  };

  // Toggle a month selection for a zone
  const toggleMonth = (zoneId: string, monthIndex: number) => {
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      const yearSchedule = { ...prev[selectedYear] };
      const zoneMonths = new Set(prev[selectedYear][zoneId] || []);

      if (zoneMonths.has(monthIndex)) {
        zoneMonths.delete(monthIndex);
      } else {
        zoneMonths.add(monthIndex);
      }

      yearSchedule[zoneId] = zoneMonths;
      newSchedule[selectedYear] = yearSchedule;
      return newSchedule;
    });
  };

  // Check if a month is selected for a zone
  const isZoneMonthSelected = (zoneId: string, monthIndex: number) => {
    return schedule[selectedYear]?.[zoneId]?.has(monthIndex) || false;
  };

  // Toggle site expansion in species view
  const toggleSpeciesSiteExpanded = (siteId: number) => {
    setExpandedSpeciesSites((prev) => {
      const next = new Set(prev);
      if (next.has(siteId)) {
        next.delete(siteId);
      } else {
        next.add(siteId);
      }
      return next;
    });
  };

  // Get species assignments for a zone or site
  const getZoneSpecies = (zoneId: string): SpeciesAssignment[] => {
    return speciesSchedule[zoneId] || [];
  };

  // Get species name by ID
  const getSpeciesName = (speciesId: string): string => {
    const species = availableSpecies.find((s) => s.id === speciesId);
    return species ? species.commonName : "Unknown";
  };

  // Get species scientific name by ID
  const getSpeciesScientificName = (speciesId: string): string => {
    const species = availableSpecies.find((s) => s.id === speciesId);
    return species ? species.scientificName : "";
  };

  // Get total plants for a zone
  const getZoneTotalPlants = (zoneId: string): number => {
    const assignments = speciesSchedule[zoneId] || [];
    return assignments.reduce((sum, a) => sum + a.quantity, 0);
  };

  // Get total plants for a site (sum of all zones)
  const getSiteTotalPlants = (site: PlantingSite): number => {
    if (site.zones.length === 0) {
      return getZoneTotalPlants(`site-${site.id}`);
    }
    return site.zones.reduce((sum, zone) => sum + getZoneTotalPlants(zone.id), 0);
  };

  // Get aggregated species for a site (combined from all zones)
  const getSiteSpeciesAggregate = (site: PlantingSite): Map<string, number> => {
    const aggregate = new Map<string, number>();
    const zoneIds =
      site.zones.length === 0
        ? [`site-${site.id}`]
        : site.zones.map((z) => z.id);

    zoneIds.forEach((zoneId) => {
      const assignments = speciesSchedule[zoneId] || [];
      assignments.forEach((a) => {
        const current = aggregate.get(a.speciesId) || 0;
        aggregate.set(a.speciesId, current + a.quantity);
      });
    });

    return aggregate;
  };

  // Add species to a zone
  const addSpeciesToZone = (zoneId: string, speciesId: string) => {
    setSpeciesSchedule((prev) => {
      const existing = prev[zoneId] || [];
      // Check if species already exists
      if (existing.some((a) => a.speciesId === speciesId)) {
        return prev;
      }
      return {
        ...prev,
        [zoneId]: [...existing, { speciesId, quantity: 0 }],
      };
    });
  };

  // Update species quantity in a zone
  const updateSpeciesQuantity = (
    zoneId: string,
    speciesId: string,
    quantity: number
  ) => {
    setSpeciesSchedule((prev) => {
      const existing = prev[zoneId] || [];
      return {
        ...prev,
        [zoneId]: existing.map((a) =>
          a.speciesId === speciesId ? { ...a, quantity: Math.max(0, quantity) } : a
        ),
      };
    });
  };

  // Remove species from a zone
  const removeSpeciesFromZone = (zoneId: string, speciesId: string) => {
    setSpeciesSchedule((prev) => {
      const existing = prev[zoneId] || [];
      return {
        ...prev,
        [zoneId]: existing.filter((a) => a.speciesId !== speciesId),
      };
    });
  };

  // Get available species not yet assigned to a zone
  const getUnassignedSpecies = (zoneId: string): Species[] => {
    const assigned = new Set(
      (speciesSchedule[zoneId] || []).map((a) => a.speciesId)
    );
    return availableSpecies.filter((s) => !assigned.has(s.id));
  };

  // Get aggregate selection for a site (union of all zones, or site-level for 0 zones)
  const getSiteAggregateMonths = (site: PlantingSite): Set<number> => {
    if (site.zones.length === 0) {
      return schedule[selectedYear]?.[`site-${site.id}`] || new Set<number>();
    }
    const aggregate = new Set<number>();
    site.zones.forEach((zone) => {
      const zoneMonths = schedule[selectedYear]?.[zone.id];
      if (zoneMonths) {
        zoneMonths.forEach((month) => aggregate.add(month));
      }
    });
    return aggregate;
  };

  // Check if a site is directly editable (0 or 1 zone)
  const isSiteDirectlyEditable = (site: PlantingSite): boolean => {
    return site.zones.length <= 1;
  };

  // Toggle month for a site (when directly editable)
  const toggleSiteMonth = (site: PlantingSite, monthIndex: number) => {
    const editableId = getSiteEditableId(site);
    toggleMonth(editableId, monthIndex);
  };

  // Check if this cell is part of a contiguous selection (for rounded corners)
  const getSelectionPosition = (
    isSelectedFn: (monthIndex: number) => boolean,
    monthIndex: number,
  ) => {
    const selected = isSelectedFn(monthIndex);
    if (!selected) return null;

    const prevSelected = monthIndex > 0 && isSelectedFn(monthIndex - 1);
    const nextSelected = monthIndex < 11 && isSelectedFn(monthIndex + 1);

    if (!prevSelected && !nextSelected) return "single";
    if (!prevSelected) return "start";
    if (!nextSelected) return "end";
    return "middle";
  };

  return (
    <Page maxWidth={false}>
      {/* TODO: Future enhancements to explore:
          - Planning seasons that span multiple years
          - Repeating seasons across years */}

      {/* Sticky Header with Title and Action Buttons */}
      <Box
        sx={{
          position: "sticky",
          top: 60, // Below the TopNav
          zIndex: 100,
          backgroundColor: hasChanges ? "#FFF" : STICKY_HEADER_BG,
          mx: -3, // Extend to page edges
          px: 3,
          py: 2.5,
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${BORDER_COLOR}`,
          boxShadow: hasChanges ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          transition: "background-color 0.2s, box-shadow 0.2s",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography
              component="h1"
              sx={{
                fontSize: "24px",
                fontWeight: 600,
                color: TEXT_PRIMARY,
                margin: 0,
              }}
            >
              Planting Plan:
            </Typography>
            <Box
              onClick={(e) => setViewMenuAnchor(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                ml: 1,
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: "24px",
                  fontWeight: 600,
                  color: SITE_BAR_BG,
                  margin: 0,
                }}
              >
                {VIEW_LABELS[currentView]}
              </Typography>
              <KeyboardArrowDown sx={{ color: SITE_BAR_BG, fontSize: 28 }} />
            </Box>
          </Box>
          <Menu
            anchorEl={viewMenuAnchor}
            open={viewMenuOpen}
            onClose={() => setViewMenuAnchor(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            {VIEW_ORDER.map((view) => (
              <MenuItem
                key={view}
                selected={view === currentView}
                onClick={() => {
                  setCurrentView(view);
                  setViewMenuAnchor(null);
                }}
                sx={{
                  fontSize: "14px",
                  minWidth: 120,
                }}
              >
                {VIEW_LABELS[view]}
              </MenuItem>
            ))}
          </Menu>
          {hasChanges && (
            <Box
              sx={{
                backgroundColor: "#FEF3C7",
                color: "#92400E",
                fontSize: "12px",
                fontWeight: 500,
                px: 1.5,
                py: 0.5,
                borderRadius: "4px",
              }}
            >
              Unsaved changes
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            label="Discard Changes"
            onClick={handleDiscard}
            disabled={!hasChanges}
            type="passive"
            priority="secondary"
            size="medium"
          />
          <Button
            label="Save Changes"
            onClick={handleSave}
            disabled={!hasChanges}
            type="productive"
            priority="primary"
            size="medium"
          />
        </Box>
      </Box>

      {/* Schedule View */}
      {currentView === "schedule" && (
      <Card title="Planting Schedule">
        <Typography sx={{ color: TEXT_SECONDARY, mb: 2 }}>
          For each planting site, select the site zones you plan to plant each
          month of the year.
        </Typography>

        {/* Legend */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 16,
                backgroundColor: SITE_BAR_BG,
                borderRadius: "4px",
              }}
            />
            <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
              Site aggregate
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 16,
                backgroundColor: ZONE_BAR_BG,
                borderRadius: "4px",
              }}
            />
            <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
              Zone planting period
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 16,
                backgroundColor: WET_SEASON_BG,
                borderRadius: "4px",
                border: "1px solid rgba(181, 212, 232, 0.5)",
              }}
            />
            <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
              Wet season
            </Typography>
          </Box>
        </Box>

        {/* Year Tabs - directly above table */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `2px solid ${BORDER_COLOR}`,
            mb: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Tabs
              value={selectedYear}
              onChange={(_, newYear) => setSelectedYear(newYear)}
              sx={{
                minHeight: 40,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: TEXT_SECONDARY,
                  minWidth: 60,
                  minHeight: 40,
                  py: 1,
                },
                "& .Mui-selected": {
                  color: `${SITE_BAR_BG} !important`,
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: SITE_BAR_BG,
                },
              }}
            >
              {years.map((year) => (
                <Tab key={year} label={year} value={year} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {years.length > 1 && (
              <IconButton
                size="small"
                onClick={handleRemoveYearClick}
                sx={{ color: TEXT_SECONDARY }}
                title={`Remove ${Math.max(...years)}`}
              >
                <RemoveIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={handleAddYear}
              sx={{ color: TEXT_SECONDARY }}
              title="Add year"
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Gantt Chart Container */}
        <Box sx={{ overflowX: "auto" }}>
          <Box sx={{ minWidth: 900 }}>
            {/* Header Row - Months */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "280px repeat(12, 1fr)",
                borderBottom: `1px solid ${BORDER_COLOR}`,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: HEADER_BG,
                  borderRight: `1px solid ${BORDER_COLOR}`,
                  fontWeight: 600,
                  fontSize: "13px",
                  color: TEXT_PRIMARY,
                }}
              >
                Planting Site / Zone
              </Box>
              {MONTHS.map((month, index) => {
                const yearShort = String(selectedYear).slice(-2);

                return (
                  <Box
                    key={month}
                    sx={{
                      p: 1,
                      backgroundColor: HEADER_BG,
                      borderRight:
                        index < 11 ? `1px solid ${BORDER_COLOR}` : "none",
                      textAlign: "center",
                      fontWeight: 500,
                      fontSize: "12px",
                      color: TEXT_SECONDARY,
                    }}
                  >
                    {month} '{yearShort}
                  </Box>
                );
              })}
            </Box>

            {/* Site Rows with expandable Zones */}
            {mockPlantingSites.map((site, siteIndex) => {
              const isExpanded = expandedSites.has(site.id);
              const aggregateMonths = getSiteAggregateMonths(site);
              const isDirectlyEditable = isSiteDirectlyEditable(site);
              const canExpand = site.zones.length > 1;

              return (
                <Box key={site.id}>
                  {/* Site Row (clickable to expand if has multiple zones, or editable if 0-1 zones) */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "280px repeat(12, 1fr)",
                      borderTop: siteIndex > 0 ? `1px solid ${SITE_BORDER_COLOR}` : "none",
                      borderBottom: isExpanded ? `1px solid ${BORDER_COLOR}` : "none",
                      cursor: canExpand ? "pointer" : "default",
                      "&:hover": canExpand ? {
                        backgroundColor: "rgba(0, 0, 0, 0.02)",
                      } : {},
                    }}
                    onClick={canExpand ? () => toggleSiteExpanded(site.id) : undefined}
                  >
                    {/* Site info */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRight: `1px solid ${BORDER_COLOR}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      {/* Expand/Collapse icon - only show if multiple zones */}
                      {canExpand ? (
                        <Box sx={{ color: TEXT_SECONDARY, display: "flex" }}>
                          {isExpanded ? (
                            <KeyboardArrowDown sx={{ fontSize: 20 }} />
                          ) : (
                            <KeyboardArrowRight sx={{ fontSize: 20 }} />
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ width: 20 }} /> // Spacer for alignment
                      )}
                      <LocationIcon
                        sx={{ color: TEXT_SECONDARY, fontSize: 20 }}
                      />
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: "14px",
                            color: TEXT_PRIMARY,
                            lineHeight: 1.3,
                          }}
                        >
                          {site.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: TEXT_SECONDARY,
                            lineHeight: 1.3,
                          }}
                        >
                          {site.location} · {site.area}
                          {site.zones.length > 0 && ` · ${site.zones.length} zone${site.zones.length > 1 ? "s" : ""}`}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Month cells - editable if 0-1 zones, read-only aggregate if multiple zones */}
                    {MONTHS.map((_, monthIndex) => {
                      const selected = aggregateMonths.has(monthIndex);
                      const isWetMonth = site.wetSeasonMonths.has(monthIndex);
                      const position = getSelectionPosition(
                        (m) => aggregateMonths.has(m),
                        monthIndex,
                      );

                      return (
                        <Box
                          key={monthIndex}
                          onClick={isDirectlyEditable ? (e) => {
                            e.stopPropagation();
                            toggleSiteMonth(site, monthIndex);
                          } : undefined}
                          sx={{
                            p: 0.5,
                            borderRight:
                              monthIndex < 11
                                ? `1px solid ${BORDER_COLOR}`
                                : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isWetMonth
                              ? WET_SEASON_BG
                              : "transparent",
                            cursor: isDirectlyEditable ? "pointer" : "default",
                            transition: isDirectlyEditable ? "background-color 0.15s" : "none",
                            "&:hover": isDirectlyEditable ? {
                              backgroundColor: selected
                                ? ZONE_BAR_HOVER
                                : isWetMonth
                                  ? "rgba(181, 212, 232, 0.3)"
                                  : "rgba(125, 168, 138, 0.2)",
                            } : {},
                          }}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              height: 28,
                              backgroundColor: selected
                                ? SITE_BAR_BG
                                : "transparent",
                              borderRadius:
                                position === "single"
                                  ? "6px"
                                  : position === "start"
                                    ? "6px 0 0 6px"
                                    : position === "end"
                                      ? "0 6px 6px 0"
                                      : "0",
                              transition: isDirectlyEditable ? "background-color 0.15s" : "none",
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Zone Rows (collapsible) */}
                  <Collapse in={isExpanded}>
                    {site.zones.map((zone, zoneIndex) => (
                      <Box
                        key={zone.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "280px repeat(12, 1fr)",
                          borderBottom:
                            zoneIndex < site.zones.length - 1
                              ? `1px solid ${BORDER_COLOR}`
                              : "none",
                          backgroundColor: ZONE_ROW_BG,
                          "&:hover": {
                            backgroundColor: "#F5F5F5",
                          },
                        }}
                      >
                        {/* Zone info (indented) - clickable to open map */}
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            openZoneMap(site, zone);
                          }}
                          sx={{
                            p: 1.5,
                            pl: 6,
                            borderRight: `1px solid ${BORDER_COLOR}`,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "#F0F0F0",
                            },
                          }}
                        >
                          <ZoneIcon
                            sx={{ color: TEXT_SECONDARY, fontSize: 18 }}
                          />
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 400,
                                fontSize: "13px",
                                color: TEXT_PRIMARY,
                                lineHeight: 1.3,
                                "&:hover": {
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              {zone.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "11px",
                                color: TEXT_SECONDARY,
                                lineHeight: 1.3,
                              }}
                            >
                              {zone.area}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Zone month cells (editable) */}
                        {MONTHS.map((_, monthIndex) => {
                          const selected = isZoneMonthSelected(
                            zone.id,
                            monthIndex,
                          );
                          const isWetMonth = site.wetSeasonMonths.has(monthIndex);
                          const position = getSelectionPosition(
                            (m) => isZoneMonthSelected(zone.id, m),
                            monthIndex,
                          );

                          return (
                            <Box
                              key={monthIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMonth(zone.id, monthIndex);
                              }}
                              sx={{
                                p: 0.5,
                                borderRight:
                                  monthIndex < 11
                                    ? `1px solid ${BORDER_COLOR}`
                                    : "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: isWetMonth
                                  ? WET_SEASON_ZONE_BG
                                  : "transparent",
                                transition: "background-color 0.15s",
                                "&:hover": {
                                  backgroundColor: selected
                                    ? ZONE_BAR_HOVER
                                    : "rgba(125, 168, 138, 0.2)",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: "100%",
                                  height: 24,
                                  backgroundColor: selected
                                    ? ZONE_BAR_BG
                                    : "transparent",
                                  borderRadius:
                                    position === "single"
                                      ? "5px"
                                      : position === "start"
                                        ? "5px 0 0 5px"
                                        : position === "end"
                                          ? "0 5px 5px 0"
                                          : "0",
                                  transition: "background-color 0.15s",
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Summary */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: HEADER_BG,
            borderRadius: "8px",
          }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: "14px",
              color: TEXT_PRIMARY,
              mb: 1,
            }}
          >
            {selectedYear} Planning Summary
          </Typography>
          {mockPlantingSites.map((site) => {
            // Handle sites with no zones
            if (site.zones.length === 0) {
              const selectedMonths = Array.from(
                schedule[selectedYear]?.[`site-${site.id}`] || [],
              );
              return (
                <Typography
                  key={site.id}
                  sx={{ fontSize: "13px", color: TEXT_SECONDARY, mb: 0.5 }}
                >
                  <strong>{site.name}:</strong>{" "}
                  {selectedMonths.length > 0
                    ? formatMonthRanges(selectedMonths)
                    : "No months selected"}
                </Typography>
              );
            }

            const hasAnyPlanning = site.zones.some((zone) => {
              const months = schedule[selectedYear]?.[zone.id];
              return months && months.size > 0;
            });

            if (!hasAnyPlanning) {
              return (
                <Typography
                  key={site.id}
                  sx={{ fontSize: "13px", color: TEXT_SECONDARY, mb: 0.5 }}
                >
                  <strong>{site.name}:</strong> No months selected
                </Typography>
              );
            }

            // Sites with single zone - show inline
            if (site.zones.length === 1) {
              const selectedMonths = Array.from(
                schedule[selectedYear]?.[site.zones[0].id] || [],
              );
              return (
                <Typography
                  key={site.id}
                  sx={{ fontSize: "13px", color: TEXT_SECONDARY, mb: 0.5 }}
                >
                  <strong>{site.name}:</strong>{" "}
                  {formatMonthRanges(selectedMonths)}
                </Typography>
              );
            }

            // Sites with multiple zones - show expanded
            return (
              <Box key={site.id} sx={{ mb: 1 }}>
                <Typography
                  sx={{
                    fontSize: "13px",
                    color: TEXT_PRIMARY,
                    fontWeight: 500,
                  }}
                >
                  {site.name}:
                </Typography>
                {site.zones.map((zone) => {
                  const selectedMonths = Array.from(
                    schedule[selectedYear]?.[zone.id] || [],
                  );
                  if (selectedMonths.length === 0) return null;

                  return (
                    <Typography
                      key={zone.id}
                      sx={{ fontSize: "12px", color: TEXT_SECONDARY, ml: 2 }}
                    >
                      {zone.name}: {formatMonthRanges(selectedMonths)}
                    </Typography>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Card>
      )}

      {/* Species View */}
      {currentView === "species" && (
        <Card title="Species Planning">
          <Typography sx={{ color: TEXT_SECONDARY, mb: 3 }}>
            Define target species and quantities for each planting zone. Expand a site to edit its zone-level species assignments.
          </Typography>

          {/* Site List */}
          <Box sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", overflow: "hidden" }}>
            {mockPlantingSites.map((site, siteIndex) => {
              const isExpanded = expandedSpeciesSites.has(site.id);
              const siteTotalPlants = getSiteTotalPlants(site);
              const siteAggregate = getSiteSpeciesAggregate(site);
              const hasZones = site.zones.length > 0;
              const canExpand = hasZones; // Can expand if site has any zones

              return (
                <Box key={site.id}>
                  {/* Site Header Row */}
                  <Box
                    onClick={canExpand ? () => toggleSpeciesSiteExpanded(site.id) : undefined}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      backgroundColor: siteIndex % 2 === 0 ? "white" : ZONE_ROW_BG,
                      borderTop: siteIndex > 0 ? `1px solid ${SITE_BORDER_COLOR}` : "none",
                      cursor: canExpand ? "pointer" : "default",
                      "&:hover": canExpand ? { backgroundColor: "#F5F5F0" } : {},
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      {/* Expand/Collapse icon */}
                      {canExpand ? (
                        <Box sx={{ color: TEXT_SECONDARY, display: "flex" }}>
                          {isExpanded ? (
                            <KeyboardArrowDown sx={{ fontSize: 20 }} />
                          ) : (
                            <KeyboardArrowRight sx={{ fontSize: 20 }} />
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ width: 20 }} />
                      )}
                      <LocationIcon sx={{ color: TEXT_SECONDARY, fontSize: 20 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 500, fontSize: "14px", color: TEXT_PRIMARY }}>
                          {site.name}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                          {site.location} · {site.area}
                          {site.zones.length > 0 && ` · ${site.zones.length} zone${site.zones.length > 1 ? "s" : ""}`}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Site totals */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                          Species
                        </Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: TEXT_PRIMARY }}>
                          {siteAggregate.size}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right", minWidth: 80 }}>
                        <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                          Total Plants
                        </Typography>
                        <Typography sx={{ fontSize: "14px", fontWeight: 500, color: SITE_BAR_BG }}>
                          {siteTotalPlants.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Site with no zones - show species table directly */}
                  {!hasZones && (
                    <Box
                      sx={{
                        backgroundColor: ZONE_ROW_BG,
                        borderTop: `1px solid ${BORDER_COLOR}`,
                        p: 2,
                        pl: 6,
                      }}
                    >
                      <SpeciesTable
                        zoneId={`site-${site.id}`}
                        assignments={getZoneSpecies(`site-${site.id}`)}
                        unassignedSpecies={getUnassignedSpecies(`site-${site.id}`)}
                        getSpeciesName={getSpeciesName}
                        getSpeciesScientificName={getSpeciesScientificName}
                        onAddSpecies={(speciesId) => addSpeciesToZone(`site-${site.id}`, speciesId)}
                        onUpdateQuantity={(speciesId, qty) =>
                          updateSpeciesQuantity(`site-${site.id}`, speciesId, qty)
                        }
                        onRemoveSpecies={(speciesId) =>
                          removeSpeciesFromZone(`site-${site.id}`, speciesId)
                        }
                        totalPlants={getZoneTotalPlants(`site-${site.id}`)}
                      />
                    </Box>
                  )}

                  {/* Expandable zones (1+ zones) */}
                  {hasZones && (
                    <Collapse in={isExpanded}>
                      {site.zones.map((zone) => {
                        const zoneAssignments = getZoneSpecies(zone.id);
                        const zoneTotalPlants = getZoneTotalPlants(zone.id);
                        const unassigned = getUnassignedSpecies(zone.id);

                        return (
                          <Box
                            key={zone.id}
                            sx={{
                              backgroundColor: ZONE_ROW_BG,
                              borderTop: `1px solid ${BORDER_COLOR}`,
                            }}
                          >
                            {/* Zone header */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: 2,
                                pl: 6,
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <ZoneIcon sx={{ color: TEXT_SECONDARY, fontSize: 18 }} />
                                <Box>
                                  <Typography sx={{ fontSize: "13px", fontWeight: 500, color: TEXT_PRIMARY }}>
                                    {zone.name}
                                  </Typography>
                                  <Typography sx={{ fontSize: "11px", color: TEXT_SECONDARY }}>
                                    {zone.area}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY }}>
                                  {zoneAssignments.length} species
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    color: ZONE_BAR_BG,
                                    minWidth: 80,
                                    textAlign: "right",
                                  }}
                                >
                                  {zoneTotalPlants.toLocaleString()} plants
                                </Typography>
                              </Box>
                            </Box>

                            {/* Zone species table */}
                            <Box sx={{ px: 2, pb: 2, pl: 6 }}>
                              <SpeciesTable
                                zoneId={zone.id}
                                assignments={zoneAssignments}
                                unassignedSpecies={unassigned}
                                getSpeciesName={getSpeciesName}
                                getSpeciesScientificName={getSpeciesScientificName}
                                onAddSpecies={(speciesId) => addSpeciesToZone(zone.id, speciesId)}
                                onUpdateQuantity={(speciesId, qty) =>
                                  updateSpeciesQuantity(zone.id, speciesId, qty)
                                }
                                onRemoveSpecies={(speciesId) =>
                                  removeSpeciesFromZone(zone.id, speciesId)
                                }
                                totalPlants={zoneTotalPlants}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Grand Total Summary */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              backgroundColor: HEADER_BG,
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontWeight: 500, fontSize: "14px", color: TEXT_PRIMARY }}>
              Total Across All Sites
            </Typography>
            <Box sx={{ display: "flex", gap: 4 }}>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                  Unique Species
                </Typography>
                <Typography sx={{ fontSize: "16px", fontWeight: 600, color: TEXT_PRIMARY }}>
                  {(() => {
                    const allSpecies = new Set<string>();
                    mockPlantingSites.forEach((site) => {
                      const zoneIds =
                        site.zones.length === 0
                          ? [`site-${site.id}`]
                          : site.zones.map((z) => z.id);
                      zoneIds.forEach((zoneId) => {
                        (speciesSchedule[zoneId] || []).forEach((a) =>
                          allSpecies.add(a.speciesId)
                        );
                      });
                    });
                    return allSpecies.size;
                  })()}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                  Total Plants
                </Typography>
                <Typography sx={{ fontSize: "16px", fontWeight: 600, color: SITE_BAR_BG }}>
                  {mockPlantingSites
                    .reduce((sum, site) => sum + getSiteTotalPlants(site), 0)
                    .toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      )}

      {/* Overview - Placeholder */}
      {currentView === "overview" && (
        <Card title="Planting Overview">
          <Typography sx={{ color: TEXT_SECONDARY, mb: 2 }}>
            Combined view of planting schedule and species requirements.
          </Typography>
          <Box
            sx={{
              p: 4,
              backgroundColor: HEADER_BG,
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: TEXT_SECONDARY, fontStyle: "italic" }}>
              Planting overview interface coming soon...
            </Typography>
          </Box>
        </Card>
      )}

      {/* Delete Year Confirmation Modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-year-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxWidth: "90vw",
            bgcolor: "white",
            borderRadius: "12px",
            boxShadow: 24,
            outline: "none",
            p: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: "18px",
              fontWeight: 600,
              color: TEXT_PRIMARY,
              mb: 2,
            }}
          >
            Delete {yearToDelete}?
          </Typography>
          <Typography sx={{ fontSize: "14px", color: TEXT_SECONDARY, mb: 3 }}>
            You have planting data entered for {yearToDelete}. Are you sure you
            want to delete this year? This action cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              label="Cancel"
              onClick={handleCancelDelete}
              type="passive"
              priority="secondary"
              size="medium"
            />
            <Button
              label="Delete"
              onClick={handleConfirmDelete}
              type="destructive"
              priority="primary"
              size="medium"
            />
          </Box>
        </Box>
      </Modal>

      {/* Zone Map Modal */}
      <Modal
        open={zoneModalOpen}
        onClose={closeZoneMap}
        aria-labelledby="zone-map-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            maxWidth: "90vw",
            bgcolor: "white",
            borderRadius: "12px",
            boxShadow: 24,
            outline: "none",
          }}
        >
          {selectedZoneForMap && (
            <>
              {/* Modal Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2.5,
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    {selectedZoneForMap.site.name}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY }}>
                    {selectedZoneForMap.site.location} ·{" "}
                    {selectedZoneForMap.site.area}
                  </Typography>
                </Box>
                <IconButton onClick={closeZoneMap} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Map Placeholder */}
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    backgroundColor: "#E8EDE5",
                    borderRadius: "8px",
                    height: 350,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  {/* Simulated zone map - divide into zones */}
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "11px",
                        color: TEXT_SECONDARY,
                        mb: 1,
                        textAlign: "center",
                      }}
                    >
                      [Placeholder: Satellite Map View]
                    </Typography>

                    {/* Zone visualization */}
                    <Box
                      sx={{
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns:
                          selectedZoneForMap.site.zones.length === 2
                            ? "1fr 1fr"
                            : "1fr 1fr 1fr",
                        gridTemplateRows:
                          selectedZoneForMap.site.zones.length > 3
                            ? "1fr 1fr"
                            : "1fr",
                        gap: 1,
                        p: 1,
                      }}
                    >
                      {selectedZoneForMap.site.zones.map((zone, index) => {
                        const isHighlighted =
                          zone.id === selectedZoneForMap.zone.id;
                        return (
                          <Box
                            key={zone.id}
                            sx={{
                              backgroundColor: isHighlighted
                                ? ZONE_HIGHLIGHT
                                : ZONE_MAP_COLORS[
                                    index % ZONE_MAP_COLORS.length
                                  ],
                              borderRadius: "8px",
                              border: isHighlighted
                                ? "3px solid #2D5A3D"
                                : "1px solid rgba(0,0,0,0.1)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              p: 2,
                              transition: "all 0.2s",
                              boxShadow: isHighlighted
                                ? "0 4px 12px rgba(74, 124, 89, 0.3)"
                                : "none",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "14px",
                                fontWeight: isHighlighted ? 600 : 500,
                                color: isHighlighted ? "white" : TEXT_PRIMARY,
                                textAlign: "center",
                              }}
                            >
                              {zone.name.split(" - ")[0]}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "11px",
                                color: isHighlighted
                                  ? "rgba(255,255,255,0.85)"
                                  : TEXT_SECONDARY,
                                textAlign: "center",
                              }}
                            >
                              {zone.name.split(" - ")[1] || ""}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: isHighlighted ? "white" : TEXT_PRIMARY,
                                mt: 1,
                              }}
                            >
                              {zone.area}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>

                {/* Selected Zone Details */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: HEADER_BG,
                    borderRadius: "8px",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: "14px",
                      color: TEXT_PRIMARY,
                      mb: 0.5,
                    }}
                  >
                    {selectedZoneForMap.zone.name}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY }}>
                    Area: {selectedZoneForMap.zone.area}
                  </Typography>
                  {(() => {
                    const selectedMonths = Array.from(
                      schedule[selectedYear]?.[selectedZoneForMap.zone.id] ||
                        [],
                    );
                    return (
                      <Typography
                        sx={{
                          fontSize: "13px",
                          color: TEXT_SECONDARY,
                          mt: 0.5,
                        }}
                      >
                        {selectedYear} Planting:{" "}
                        {formatMonthRanges(selectedMonths)}
                      </Typography>
                    );
                  })()}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Page>
  );
}
