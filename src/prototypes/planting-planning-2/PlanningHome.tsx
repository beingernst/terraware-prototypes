import { useState, useMemo, useCallback } from "react";
import { Page } from "@/components/layout";
import { Card } from "@/components/core";
import {
  Typography,
  Box,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  LinearProgress,
  Chip,
  Tooltip,
} from "@mui/material";
import { Button } from "@terraware/web-components";
import {
  KeyboardArrowDown,
  LocationOn as LocationIcon,
  GridView as ZoneIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Inventory as InventoryIcon,
  Park as PlantIcon,
} from "@mui/icons-material";

import {
  mockSpecies,
  mockPlantingSites,
  mockSpeciesTargets,
  mockAllocations,
  getSpeciesById,
  getSiteById,
  getSeasonForSite,
  getTotalInventoryForSpecies,
  getReadyInventoryForSpecies,
  getTotalDemandForSpecies,
  formatDateRange,
  type SpeciesTarget,
  type Allocation,
  type AllocationStatus,
} from "./mockData";

// Colors
const HEADER_BG = "#F5F5F0";
const PRIMARY_GREEN = "#4A7C59";
const BORDER_COLOR = "#E8E5E0";
const TEXT_PRIMARY = "#3A4445";
const TEXT_SECONDARY = "#6B7165";
const ZONE_ROW_BG = "#FAFAFA";
const STICKY_HEADER_BG = "rgb(249, 248, 247)";

// Status colors
const STATUS_FULFILLED = "#4CAF50";
const STATUS_PARTIAL = "#FF9800";
const STATUS_GAP = "#F44336";
const STATUS_UNALLOCATED = "#9E9E9E";

// View options
type PlanView = "setup" | "allocations" | "progress";
const VIEW_LABELS: Record<PlanView, string> = {
  setup: "Setup",
  allocations: "Allocations",
  progress: "Progress",
};
const VIEW_ORDER: PlanView[] = ["setup", "allocations", "progress"];

// Status helpers
function getStatusColor(status: AllocationStatus): string {
  switch (status) {
    case "fulfilled":
      return STATUS_FULFILLED;
    case "partial":
      return STATUS_PARTIAL;
    case "gap":
      return STATUS_GAP;
    case "unallocated":
      return STATUS_UNALLOCATED;
  }
}

function getStatusIcon(status: AllocationStatus) {
  switch (status) {
    case "fulfilled":
      return <CheckIcon sx={{ fontSize: 18, color: STATUS_FULFILLED }} />;
    case "partial":
      return <WarningIcon sx={{ fontSize: 18, color: STATUS_PARTIAL }} />;
    case "gap":
      return <ErrorIcon sx={{ fontSize: 18, color: STATUS_GAP }} />;
    case "unallocated":
      return null;
  }
}

function getStatusLabel(status: AllocationStatus): string {
  switch (status) {
    case "fulfilled":
      return "Fulfilled";
    case "partial":
      return "Partial";
    case "gap":
      return "Gap";
    case "unallocated":
      return "Unallocated";
  }
}

// === Setup View Component ===
interface SetupViewProps {
  selectedSiteId: number;
  setSelectedSiteId: (id: number) => void;
  targets: SpeciesTarget[];
  onAddTarget: (zoneId: string, speciesId: string, quantity: number) => void;
  onUpdateTarget: (targetId: string, quantity: number) => void;
  onDeleteTarget: (targetId: string) => void;
}

function SetupView({
  selectedSiteId,
  setSelectedSiteId,
  targets,
  onAddTarget,
  onUpdateTarget,
  onDeleteTarget,
}: SetupViewProps) {
  const site = getSiteById(selectedSiteId);
  const season = getSeasonForSite(selectedSiteId);

  // State for adding new target
  const [addingToZone, setAddingToZone] = useState<string | null>(null);
  const [newSpeciesId, setNewSpeciesId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  // Get species not yet targeted in a zone
  const getAvailableSpecies = (zoneId: string) => {
    const existingSpeciesIds = targets
      .filter((t) => t.zoneId === zoneId)
      .map((t) => t.speciesId);
    return mockSpecies.filter((s) => !existingSpeciesIds.includes(s.id));
  };

  const handleAddTarget = (zoneId: string) => {
    if (newSpeciesId && newQuantity) {
      onAddTarget(zoneId, newSpeciesId, parseInt(newQuantity));
      setAddingToZone(null);
      setNewSpeciesId("");
      setNewQuantity("");
    }
  };

  const handleCancelAdd = () => {
    setAddingToZone(null);
    setNewSpeciesId("");
    setNewQuantity("");
  };

  return (
    <Card title="Planting Plan Setup">
      <Typography sx={{ color: TEXT_SECONDARY, mb: 3 }}>
        Define target species and quantities for each zone within a planting season.
      </Typography>

      {/* Site & Season Selector */}
      <Box sx={{ display: "flex", gap: 3, mb: 4, alignItems: "flex-start" }}>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Planting Site</InputLabel>
          <Select
            value={selectedSiteId}
            label="Planting Site"
            onChange={(e) => setSelectedSiteId(e.target.value as number)}
          >
            {mockPlantingSites.map((site) => (
              <MenuItem key={site.id} value={site.id}>
                {site.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {season && (
          <Box
            sx={{
              p: 2,
              backgroundColor: HEADER_BG,
              borderRadius: "8px",
              flex: 1,
            }}
          >
            <Typography
              sx={{ fontSize: "13px", color: TEXT_SECONDARY, mb: 0.5 }}
            >
              Active Season
            </Typography>
            <Typography sx={{ fontSize: "15px", fontWeight: 500, color: TEXT_PRIMARY }}>
              {season.name}
            </Typography>
            <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY }}>
              {formatDateRange(season.startDate, season.endDate)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Site Details & Zone Targets */}
      {site && (
        <Box>
          {/* Site Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 3,
              pb: 2,
              borderBottom: `1px solid ${BORDER_COLOR}`,
            }}
          >
            <LocationIcon sx={{ color: PRIMARY_GREEN, fontSize: 24 }} />
            <Box>
              <Typography sx={{ fontSize: "18px", fontWeight: 600, color: TEXT_PRIMARY }}>
                {site.name}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY }}>
                {site.location} · {site.area} · {site.zones.length} zones
              </Typography>
            </Box>
          </Box>

          {/* Zone Tables */}
          {site.zones.map((zone) => {
            const zoneTargets = targets.filter((t) => t.zoneId === zone.id);
            const availableSpecies = getAvailableSpecies(zone.id);
            const isAdding = addingToZone === zone.id;
            const zoneTotalPlants = zoneTargets.reduce((sum, t) => sum + t.targetQuantity, 0);

            return (
              <Box
                key={zone.id}
                sx={{
                  mb: 3,
                  border: `1px solid ${BORDER_COLOR}`,
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {/* Zone Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    backgroundColor: ZONE_ROW_BG,
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <ZoneIcon sx={{ color: TEXT_SECONDARY, fontSize: 20 }} />
                    <Box>
                      <Typography sx={{ fontSize: "14px", fontWeight: 500, color: TEXT_PRIMARY }}>
                        {zone.name}
                      </Typography>
                      <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                        {zone.area}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY }}>
                      {zoneTargets.length} species
                    </Typography>
                    <Typography sx={{ fontSize: "14px", fontWeight: 500, color: PRIMARY_GREEN }}>
                      {zoneTotalPlants.toLocaleString()} plants
                    </Typography>
                  </Box>
                </Box>

                {/* Species Table */}
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          fontSize: "12px",
                          color: TEXT_SECONDARY,
                          borderBottom: `1px solid ${BORDER_COLOR}`,
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
                          width: 150,
                        }}
                      >
                        Target Quantity
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          fontSize: "12px",
                          color: TEXT_SECONDARY,
                          borderBottom: `1px solid ${BORDER_COLOR}`,
                          width: 120,
                        }}
                      >
                        Available
                      </TableCell>
                      <TableCell
                        sx={{
                          borderBottom: `1px solid ${BORDER_COLOR}`,
                          width: 50,
                        }}
                      />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {zoneTargets.map((target) => {
                      const species = getSpeciesById(target.speciesId);
                      const available = getTotalInventoryForSpecies(target.speciesId);
                      const hasGap = available < target.targetQuantity;

                      return (
                        <TableRow key={target.id}>
                          <TableCell sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, py: 1.5 }}>
                            <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY }}>
                              {species?.commonName || "Unknown"}
                            </Typography>
                            <Typography sx={{ fontSize: "11px", color: TEXT_SECONDARY, fontStyle: "italic" }}>
                              {species?.scientificName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, py: 1.5 }}>
                            <TextField
                              type="number"
                              value={target.targetQuantity}
                              onChange={(e) =>
                                onUpdateTarget(target.id, parseInt(e.target.value) || 0)
                              }
                              size="small"
                              sx={{
                                width: 100,
                                "& .MuiOutlinedInput-root": { fontSize: "13px" },
                                "& input": { py: 0.75, px: 1 },
                              }}
                              slotProps={{ htmlInput: { min: 0 } }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, py: 1.5 }}>
                            <Typography
                              sx={{
                                fontSize: "13px",
                                color: hasGap ? STATUS_GAP : TEXT_SECONDARY,
                                fontWeight: hasGap ? 500 : 400,
                              }}
                            >
                              {available.toLocaleString()}
                              {hasGap && (
                                <Tooltip title={`Need ${(target.targetQuantity - available).toLocaleString()} more`}>
                                  <WarningIcon
                                    sx={{ fontSize: 14, ml: 0.5, verticalAlign: "text-bottom" }}
                                  />
                                </Tooltip>
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, py: 1.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => onDeleteTarget(target.id)}
                              sx={{ color: TEXT_SECONDARY, "&:hover": { color: STATUS_GAP } }}
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* Add New Species Row */}
                    {isAdding ? (
                      <TableRow>
                        <TableCell sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, py: 1.5 }}>
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                              value={newSpeciesId}
                              onChange={(e) => setNewSpeciesId(e.target.value)}
                              displayEmpty
                              sx={{ fontSize: "13px" }}
                            >
                              <MenuItem value="" disabled>
                                Select species
                              </MenuItem>
                              {availableSpecies.map((species) => (
                                <MenuItem key={species.id} value={species.id}>
                                  {species.commonName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, py: 1.5 }}>
                          <TextField
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            placeholder="Quantity"
                            size="small"
                            sx={{
                              width: 100,
                              "& .MuiOutlinedInput-root": { fontSize: "13px" },
                              "& input": { py: 0.75, px: 1 },
                            }}
                            slotProps={{ htmlInput: { min: 1 } }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, py: 1.5 }} />
                        <TableCell sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, py: 1.5 }}>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Button
                              label="Add"
                              onClick={() => handleAddTarget(zone.id)}
                              disabled={!newSpeciesId || !newQuantity}
                              type="productive"
                              priority="secondary"
                              size="small"
                            />
                            <Button
                              label="Cancel"
                              onClick={handleCancelAdd}
                              type="passive"
                              priority="secondary"
                              size="small"
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ borderBottom: "none", py: 1.5 }}>
                          {availableSpecies.length > 0 ? (
                            <Button
                              label="+ Add Species"
                              onClick={() => setAddingToZone(zone.id)}
                              type="productive"
                              priority="secondary"
                              size="small"
                            />
                          ) : (
                            <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY, fontStyle: "italic" }}>
                              All available species have been assigned
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
}

// === Allocation Board Component ===
interface AllocationBoardProps {
  targets: SpeciesTarget[];
  allocations: Allocation[];
  onAllocate: (targetId: string, quantity: number) => void;
}

function AllocationBoard({ targets, allocations, onAllocate }: AllocationBoardProps) {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);

  // Get species with demand (from targets)
  const speciesWithDemand = useMemo(() => {
    const speciesIds = new Set(targets.map((t) => t.speciesId));
    return mockSpecies.filter((s) => speciesIds.has(s.id));
  }, [targets]);

  // Helper to get allocated quantity for a species from allocations state
  const getAllocatedForSpecies = useCallback((speciesId: string): number => {
    return allocations
      .filter((a) => a.speciesId === speciesId)
      .reduce((sum, a) => sum + a.quantity, 0);
  }, [allocations]);

  // Helper to get allocated quantity for a target from allocations state
  const getAllocatedForTarget = useCallback((targetId: string): number => {
    return allocations
      .filter((a) => a.targetId === targetId)
      .reduce((sum, a) => sum + a.quantity, 0);
  }, [allocations]);

  // Get inventory summary by species
  const inventorySummary = useMemo(() => {
    const summary: Record<string, { total: number; ready: number; demand: number; allocated: number }> = {};

    speciesWithDemand.forEach((species) => {
      summary[species.id] = {
        total: getTotalInventoryForSpecies(species.id),
        ready: getReadyInventoryForSpecies(species.id),
        demand: getTotalDemandForSpecies(species.id),
        allocated: getAllocatedForSpecies(species.id),
      };
    });

    return summary;
  }, [speciesWithDemand, getAllocatedForSpecies]);

  // Get targets for selected species grouped by site/zone
  const selectedSpeciesTargets = useMemo(() => {
    if (!selectedSpeciesId) return [];
    return targets.filter((t) => t.speciesId === selectedSpeciesId);
  }, [targets, selectedSpeciesId]);

  return (
    <Card title="Allocation Board">
      <Typography sx={{ color: TEXT_SECONDARY, mb: 3 }}>
        Allocate nursery inventory to planting sites. Select a species to see demand and allocate plants.
      </Typography>

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Left Panel: Inventory List */}
        <Box sx={{ width: 380, flexShrink: 0 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
            <InventoryIcon sx={{ fontSize: 18, mr: 1, verticalAlign: "text-bottom" }} />
            Nursery Inventory
          </Typography>

          <Box sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", overflow: "hidden" }}>
            {/* Header */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 80px 80px",
                gap: 1,
                p: 1.5,
                backgroundColor: HEADER_BG,
                borderBottom: `1px solid ${BORDER_COLOR}`,
              }}
            >
              <Typography sx={{ fontSize: "12px", fontWeight: 500, color: TEXT_SECONDARY }}>
                Species
              </Typography>
              <Typography sx={{ fontSize: "12px", fontWeight: 500, color: TEXT_SECONDARY, textAlign: "right" }}>
                Available
              </Typography>
              <Typography sx={{ fontSize: "12px", fontWeight: 500, color: TEXT_SECONDARY, textAlign: "right" }}>
                Demand
              </Typography>
              <Typography sx={{ fontSize: "12px", fontWeight: 500, color: TEXT_SECONDARY, textAlign: "right" }}>
                Status
              </Typography>
            </Box>

            {/* Species Rows */}
            {speciesWithDemand.map((species) => {
              const summary = inventorySummary[species.id];
              const isSelected = selectedSpeciesId === species.id;
              const remainingDemand = summary.demand - summary.allocated;
              const hasGap = summary.total < remainingDemand;

              return (
                <Box
                  key={species.id}
                  onClick={() => setSelectedSpeciesId(species.id)}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 80px 80px",
                    gap: 1,
                    p: 1.5,
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#E8F5E9" : "white",
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                    "&:hover": {
                      backgroundColor: isSelected ? "#E8F5E9" : ZONE_ROW_BG,
                    },
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: isSelected ? 500 : 400, color: TEXT_PRIMARY }}>
                      {species.commonName}
                    </Typography>
                    <Typography sx={{ fontSize: "11px", color: TEXT_SECONDARY, fontStyle: "italic" }}>
                      {species.scientificName}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "13px",
                      color: hasGap ? STATUS_GAP : TEXT_PRIMARY,
                      textAlign: "right",
                      fontWeight: hasGap ? 500 : 400,
                    }}
                  >
                    {summary.total.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY, textAlign: "right" }}>
                    {summary.demand.toLocaleString()}
                  </Typography>
                  <Box sx={{ textAlign: "right" }}>
                    {summary.allocated >= summary.demand ? (
                      <CheckIcon sx={{ fontSize: 18, color: STATUS_FULFILLED }} />
                    ) : summary.allocated > 0 ? (
                      <WarningIcon sx={{ fontSize: 18, color: STATUS_PARTIAL }} />
                    ) : hasGap ? (
                      <ErrorIcon sx={{ fontSize: 18, color: STATUS_GAP }} />
                    ) : null}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Right Panel: Demand Detail */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
            <PlantIcon sx={{ fontSize: 18, mr: 1, verticalAlign: "text-bottom" }} />
            Planting Demand
          </Typography>

          {selectedSpeciesId ? (
            <Box sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: "8px", overflow: "hidden" }}>
              {/* Selected Species Header */}
              <Box sx={{ p: 2, backgroundColor: "#E8F5E9", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                {(() => {
                  const species = getSpeciesById(selectedSpeciesId);
                  const summary = inventorySummary[selectedSpeciesId];
                  return (
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography sx={{ fontSize: "16px", fontWeight: 600, color: TEXT_PRIMARY }}>
                          {species?.commonName}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY, fontStyle: "italic" }}>
                          {species?.scientificName}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                          Available: {summary.total.toLocaleString()} | Allocated: {summary.allocated.toLocaleString()}
                        </Typography>
                        <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                          Remaining demand: {(summary.demand - summary.allocated).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>

              {/* Targets Table */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500, fontSize: "12px", color: TEXT_SECONDARY }}>
                      Site / Zone
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "12px", color: TEXT_SECONDARY, width: 100 }}>
                      Target
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "12px", color: TEXT_SECONDARY, width: 100 }}>
                      Allocated
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, fontSize: "12px", color: TEXT_SECONDARY, width: 80 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ width: 140 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedSpeciesTargets.map((target) => {
                    const allocated = getAllocatedForTarget(target.id);
                    const status: AllocationStatus = allocated >= target.targetQuantity
                      ? "fulfilled"
                      : allocated > 0
                        ? "partial"
                        : "unallocated";
                    const remaining = target.targetQuantity - allocated;

                    // Find site and zone names
                    let siteName = "";
                    let zoneName = "";
                    for (const site of mockPlantingSites) {
                      const zone = site.zones.find((z) => z.id === target.zoneId);
                      if (zone) {
                        siteName = site.name;
                        zoneName = zone.name;
                        break;
                      }
                    }

                    return (
                      <TableRow key={target.id}>
                        <TableCell>
                          <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY }}>
                            {siteName}
                          </Typography>
                          <Typography sx={{ fontSize: "11px", color: TEXT_SECONDARY }}>
                            {zoneName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY }}>
                            {target.targetQuantity.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY }}>
                            {allocated.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(status)}
                            size="small"
                            sx={{
                              backgroundColor: `${getStatusColor(status)}20`,
                              color: getStatusColor(status),
                              fontWeight: 500,
                              fontSize: "11px",
                            }}
                            icon={getStatusIcon(status) || undefined}
                          />
                        </TableCell>
                        <TableCell>
                          {remaining > 0 && (
                            <Button
                              label={`Allocate ${Math.min(remaining, inventorySummary[selectedSpeciesId].total - inventorySummary[selectedSpeciesId].allocated).toLocaleString()}`}
                              onClick={() =>
                                onAllocate(
                                  target.id,
                                  Math.min(remaining, inventorySummary[selectedSpeciesId].total - inventorySummary[selectedSpeciesId].allocated)
                                )
                              }
                              disabled={inventorySummary[selectedSpeciesId].total - inventorySummary[selectedSpeciesId].allocated <= 0}
                              type="productive"
                              priority="secondary"
                              size="small"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                backgroundColor: ZONE_ROW_BG,
                borderRadius: "8px",
                border: `1px dashed ${BORDER_COLOR}`,
              }}
            >
              <Typography sx={{ color: TEXT_SECONDARY }}>
                Select a species from the inventory list to view and allocate to planting sites.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
}

// === Progress Dashboard Component ===
interface ProgressDashboardProps {
  targets: SpeciesTarget[];
  allocations: Allocation[];
}

function ProgressDashboard({ targets, allocations }: ProgressDashboardProps) {
  // Calculate summary stats
  const stats = useMemo(() => {
    const totalPlanned = targets.reduce((sum, t) => sum + t.targetQuantity, 0);
    const totalAllocated = allocations.reduce((sum, a) => sum + a.quantity, 0);
    const totalWithdrawn = allocations
      .filter((a) => a.status === "withdrawn" || a.status === "planted")
      .reduce((sum, a) => sum + a.quantity, 0);
    const totalPlanted = allocations
      .filter((a) => a.status === "planted")
      .reduce((sum, a) => sum + a.quantity, 0);

    return {
      totalPlanned,
      totalAllocated,
      totalWithdrawn,
      totalPlanted,
      allocationProgress: totalPlanned > 0 ? (totalAllocated / totalPlanned) * 100 : 0,
      plantingProgress: totalPlanned > 0 ? (totalPlanted / totalPlanned) * 100 : 0,
    };
  }, [targets, allocations]);

  // Calculate per-site stats
  const siteStats = useMemo(() => {
    return mockPlantingSites.map((site) => {
      const siteZoneIds = site.zones.map((z) => z.id);
      const siteTargets = targets.filter((t) => siteZoneIds.includes(t.zoneId));
      const siteTargetIds = siteTargets.map((t) => t.id);
      const siteAllocations = allocations.filter((a) => siteTargetIds.includes(a.targetId));

      const planned = siteTargets.reduce((sum, t) => sum + t.targetQuantity, 0);
      const allocated = siteAllocations.reduce((sum, a) => sum + a.quantity, 0);
      const planted = siteAllocations
        .filter((a) => a.status === "planted")
        .reduce((sum, a) => sum + a.quantity, 0);

      return {
        site,
        planned,
        allocated,
        planted,
        allocationProgress: planned > 0 ? (allocated / planned) * 100 : 0,
        plantingProgress: planned > 0 ? (planted / planned) * 100 : 0,
      };
    });
  }, [targets, allocations]);

  // Calculate per-species stats
  const speciesStats = useMemo(() => {
    const speciesIds = new Set(targets.map((t) => t.speciesId));
    return Array.from(speciesIds).map((speciesId) => {
      const species = getSpeciesById(speciesId);
      const speciesTargets = targets.filter((t) => t.speciesId === speciesId);
      const targetIds = speciesTargets.map((t) => t.id);
      const speciesAllocations = allocations.filter((a) => targetIds.includes(a.targetId));

      const planned = speciesTargets.reduce((sum, t) => sum + t.targetQuantity, 0);
      const allocated = speciesAllocations.reduce((sum, a) => sum + a.quantity, 0);
      const planted = speciesAllocations
        .filter((a) => a.status === "planted")
        .reduce((sum, a) => sum + a.quantity, 0);

      return {
        species,
        planned,
        allocated,
        planted,
        allocationProgress: planned > 0 ? (allocated / planned) * 100 : 0,
      };
    });
  }, [targets, allocations]);

  return (
    <Card title="Progress Dashboard">
      <Typography sx={{ color: TEXT_SECONDARY, mb: 3 }}>
        Track planting progress across all sites and species.
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, mb: 4 }}>
        <Box
          sx={{
            p: 2.5,
            backgroundColor: HEADER_BG,
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: TEXT_SECONDARY, mb: 0.5 }}>
            Planting Goal
          </Typography>
          <Typography sx={{ fontSize: "32px", fontWeight: 600, color: TEXT_PRIMARY, mb: 0.5 }}>
            {stats.totalPlanned.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY }}>
            plants
          </Typography>
        </Box>
        <Box
          sx={{
            p: 2.5,
            backgroundColor: "#E3F2FD",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: TEXT_SECONDARY, mb: 0.5 }}>
            Nursery Pipeline
          </Typography>
          <Typography sx={{ fontSize: "32px", fontWeight: 600, color: "#42A5F5", mb: 0.5 }}>
            {stats.totalAllocated.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY, mb: 0.5 }}>
            plants allocated from nursery
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor:
                  stats.allocationProgress >= 100
                    ? STATUS_FULFILLED
                    : stats.allocationProgress >= 70
                      ? STATUS_PARTIAL
                      : STATUS_GAP,
              }}
            />
            <Typography sx={{ fontSize: "13px", fontWeight: 500, color: TEXT_PRIMARY }}>
              {stats.allocationProgress.toFixed(0)}% of planting goal
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            p: 2.5,
            backgroundColor: "#E8F5E9",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: TEXT_SECONDARY, mb: 0.5 }}>
            Planted
          </Typography>
          <Typography sx={{ fontSize: "32px", fontWeight: 600, color: PRIMARY_GREEN, mb: 0.5 }}>
            {stats.totalPlanted.toLocaleString()}
          </Typography>
          <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY, mb: 0.5 }}>
            plants planted this season
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor:
                  stats.plantingProgress >= 100
                    ? STATUS_FULFILLED
                    : stats.plantingProgress >= 70
                      ? STATUS_PARTIAL
                      : STATUS_GAP,
              }}
            />
            <Typography sx={{ fontSize: "13px", fontWeight: 500, color: TEXT_PRIMARY }}>
              {stats.plantingProgress.toFixed(0)}% of planting goal
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Progress by Site */}
      <Typography sx={{ fontSize: "16px", fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
        Progress by Site
      </Typography>
      <Box sx={{ mb: 4 }}>
        {siteStats.map(({ site, planned, allocated, planted, allocationProgress, plantingProgress }) => (
          <Box
            key={site.id}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              py: 2,
              borderBottom: `1px solid ${BORDER_COLOR}`,
              "&:last-child": { borderBottom: "none" },
            }}
          >
            <Box sx={{ width: 200 }}>
              <Typography sx={{ fontSize: "14px", fontWeight: 500, color: TEXT_PRIMARY }}>
                {site.name}
              </Typography>
              <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                {site.location}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                  Nursery Pipeline
                </Typography>
                <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                  {allocated.toLocaleString()} / {planned.toLocaleString()} ({allocationProgress.toFixed(0)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={allocationProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#E0E0E0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#42A5F5",
                    borderRadius: 4,
                  },
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                  Planting Progress
                </Typography>
                <Typography sx={{ fontSize: "12px", color: TEXT_SECONDARY }}>
                  {planted.toLocaleString()} planted ({plantingProgress.toFixed(0)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={plantingProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#E0E0E0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: PRIMARY_GREEN,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Progress by Species */}
      <Typography sx={{ fontSize: "16px", fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
        Progress by Species
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 500, fontSize: "12px", color: TEXT_SECONDARY }}>
              Species
            </TableCell>
            <TableCell sx={{ fontWeight: 500, fontSize: "12px", color: TEXT_SECONDARY, width: 100 }}>
              Planned
            </TableCell>
            <TableCell sx={{ fontWeight: 500, fontSize: "12px", color: TEXT_SECONDARY, width: 100 }}>
              Allocated
            </TableCell>
            <TableCell sx={{ fontWeight: 500, fontSize: "12px", color: TEXT_SECONDARY, width: 100 }}>
              Planted
            </TableCell>
            <TableCell sx={{ fontWeight: 500, fontSize: "12px", color: TEXT_SECONDARY, width: 200 }}>
              Progress
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {speciesStats.map(({ species, planned, allocated, planted, allocationProgress }) => (
            <TableRow key={species?.id}>
              <TableCell>
                <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY }}>
                  {species?.commonName}
                </Typography>
                <Typography sx={{ fontSize: "11px", color: TEXT_SECONDARY, fontStyle: "italic" }}>
                  {species?.scientificName}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY }}>
                  {planned.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY }}>
                  {allocated.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontSize: "13px", color: PRIMARY_GREEN, fontWeight: 500 }}>
                  {planted.toLocaleString()}
                </Typography>
              </TableCell>
              <TableCell>
                <LinearProgress
                  variant="determinate"
                  value={allocationProgress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#E0E0E0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: allocationProgress >= 100 ? PRIMARY_GREEN : "#42A5F5",
                      borderRadius: 3,
                    },
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

// === Main Component ===
export function PlanningHome() {
  // Current view
  const [currentView, setCurrentView] = useState<PlanView>("setup");
  const [viewMenuAnchor, setViewMenuAnchor] = useState<null | HTMLElement>(null);
  const viewMenuOpen = Boolean(viewMenuAnchor);

  // Selected site for setup view
  const [selectedSiteId, setSelectedSiteId] = useState(mockPlantingSites[0].id);

  // Local state for targets and allocations (in real app, would come from API)
  const [targets, setTargets] = useState<SpeciesTarget[]>(mockSpeciesTargets);
  const [allocations, setAllocations] = useState<Allocation[]>(mockAllocations);

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  // Handlers for targets
  const handleAddTarget = useCallback(
    (zoneId: string, speciesId: string, quantity: number) => {
      const season = getSeasonForSite(selectedSiteId);
      if (!season) return;

      const newTarget: SpeciesTarget = {
        id: `target-new-${Date.now()}`,
        seasonId: season.id,
        zoneId,
        speciesId,
        targetQuantity: quantity,
      };
      setTargets((prev) => [...prev, newTarget]);
      setHasChanges(true);
    },
    [selectedSiteId]
  );

  const handleUpdateTarget = useCallback((targetId: string, quantity: number) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, targetQuantity: quantity } : t))
    );
    setHasChanges(true);
  }, []);

  const handleDeleteTarget = useCallback((targetId: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== targetId));
    // Also remove any allocations for this target
    setAllocations((prev) => prev.filter((a) => a.targetId !== targetId));
    setHasChanges(true);
  }, []);

  // Handler for allocations
  const handleAllocate = useCallback((targetId: string, quantity: number) => {
    const target = targets.find((t) => t.id === targetId);
    if (!target) return;

    const newAllocation: Allocation = {
      id: `alloc-new-${Date.now()}`,
      speciesId: target.speciesId,
      quantity,
      targetId,
      status: "allocated",
      allocatedDate: new Date(),
    };
    setAllocations((prev) => [...prev, newAllocation]);
    setHasChanges(true);
  }, [targets]);

  // Save/Discard handlers
  const handleSave = useCallback(() => {
    // In real app, would save to API
    setHasChanges(false);
  }, []);

  const handleDiscard = useCallback(() => {
    setTargets(mockSpeciesTargets);
    setAllocations(mockAllocations);
    setHasChanges(false);
  }, []);

  // Get targets for current site
  const siteTargets = useMemo(() => {
    const site = getSiteById(selectedSiteId);
    if (!site) return [];
    const zoneIds = site.zones.map((z) => z.id);
    return targets.filter((t) => zoneIds.includes(t.zoneId));
  }, [selectedSiteId, targets]);

  return (
    <Page maxWidth={false}>
      {/* Sticky Header */}
      <Box
        sx={{
          position: "sticky",
          top: 60,
          zIndex: 100,
          backgroundColor: hasChanges ? "#FFF" : STICKY_HEADER_BG,
          mx: -3,
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
                "&:hover": { opacity: 0.8 },
              }}
            >
              <Typography
                sx={{
                  fontSize: "24px",
                  fontWeight: 600,
                  color: PRIMARY_GREEN,
                  margin: 0,
                }}
              >
                {VIEW_LABELS[currentView]}
              </Typography>
              <KeyboardArrowDown sx={{ color: PRIMARY_GREEN, fontSize: 28 }} />
            </Box>
          </Box>
          <Menu
            anchorEl={viewMenuAnchor}
            open={viewMenuOpen}
            onClose={() => setViewMenuAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          >
            {VIEW_ORDER.map((view) => (
              <MenuItem
                key={view}
                selected={view === currentView}
                onClick={() => {
                  setCurrentView(view);
                  setViewMenuAnchor(null);
                }}
                sx={{ fontSize: "14px", minWidth: 120 }}
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

      {/* View Content */}
      {currentView === "setup" && (
        <SetupView
          selectedSiteId={selectedSiteId}
          setSelectedSiteId={setSelectedSiteId}
          targets={siteTargets}
          onAddTarget={handleAddTarget}
          onUpdateTarget={handleUpdateTarget}
          onDeleteTarget={handleDeleteTarget}
        />
      )}

      {currentView === "allocations" && (
        <AllocationBoard
          targets={targets}
          allocations={allocations}
          onAllocate={handleAllocate}
        />
      )}

      {currentView === "progress" && (
        <ProgressDashboard targets={targets} allocations={allocations} />
      )}
    </Page>
  );
}
