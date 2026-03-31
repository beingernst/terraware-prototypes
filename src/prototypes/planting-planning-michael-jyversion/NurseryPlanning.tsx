/**
 * Nursery Inventory Planning page.
 *
 * Cross-cutting view of nursery inventory vs planting demand across all sites.
 */

import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';
import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  MaterialReactTable,
  MRT_TablePagination,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
} from 'material-react-table';
import {
  species,
  nurseries as nurseriesData,
  plantingSites,
  initialSiteAllocations,
  getAllocationsForSpecies,
  getTotalInventoryForSpecies,
  getNurseryNamesForSpecies,
  getNurseryInventoryForSpecies,
  nurseryPlanningSeasons,
  getSeasonAllocationsForSpecies,
  getSeasonDisplayLabel,
} from './nurseryPlanningData';

// Colors
const HEADER_BG = '#F5F5F0';
const TEXT_PRIMARY = '#3A4445';
const TEXT_SECONDARY = '#6B7165';
const BORDER_COLOR = '#E8E5E0';
const PRIMARY_GREEN = '#4A7C59';
const COLOR_FULFILLED = '#4CAF50';
const COLOR_PARTIAL = '#FF9800';
const COLOR_GAP = '#F44336';

function getProgressColor(allocated: number, target: number): string {
  if (target === 0) return COLOR_FULFILLED;
  const ratio = allocated / target;
  if (ratio >= 1) return COLOR_FULFILLED;
  if (ratio > 0.1) return COLOR_PARTIAL;
  return COLOR_GAP;
}

// Green ≥80%, yellow 41-79%, red ≤20% of requested
function getAllocatedStatusColor(allocated: number, requested: number): string {
  if (requested === 0) return TEXT_PRIMARY;
  const pct = allocated / requested;
  if (pct >= 0.8) return COLOR_FULFILLED;
  if (pct >= 0.41) return COLOR_PARTIAL;
  if (pct <= 0.2) return COLOR_GAP;
  return TEXT_PRIMARY;
}

// Green ≤20%, yellow 41-79%, red ≥80% of requested
function getRemainingStatusColor(remaining: number, requested: number): string {
  if (requested === 0) return TEXT_PRIMARY;
  const pct = remaining / requested;
  if (pct <= 0.2) return COLOR_FULFILLED;
  if (pct >= 0.41 && pct <= 0.79) return COLOR_PARTIAL;
  if (pct >= 0.8) return COLOR_GAP;
  return TEXT_PRIMARY;
}

interface SpeciesRow {
  speciesId: string;
  scientificName: string;
  commonName: string;
  nurseries: string;
  allocated: number;
  totalInventory: number;
  remaining: number;
  target: number;
  progressPct: number;
}

interface AllocDialogState {
  open: boolean;
  speciesId: string;
  seasonId: string;
  seasonName: string;
  nurseryQuantities: Record<string, number>;
}

export function NurseryPlanning() {
  const [filterDate, setFilterDate] = useState('');
  const [includedSeasonIds, setIncludedSeasonIds] = useState<Set<string>>(
    () => new Set(nurseryPlanningSeasons.map((s) => s.id))
  );
  const [activeSpeciesIds, setActiveSpeciesIds] = useState<string[]>([
    'sp1', 'sp2', 'sp3', 'sp4', 'sp5',
  ]);
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);
  // Per-species per-season per-nursery allocations: { [speciesId]: { [seasonId]: { [nurseryName]: qty } } }
  const [nurserySeasonAllocs, setNurserySeasonAllocs] = useState<
    Record<string, Record<string, Record<string, number>>>
  >({});
  // Per-species per-site allocation edits for the detail panel: { [speciesId]: { [siteId]: number } }
  const [siteAllocationEdits, setSiteAllocationEdits] = useState<Record<string, Record<string, number>>>({});
  const [isAddingSpecies, setIsAddingSpecies] = useState(false);
  const [dialogState, setDialogState] = useState<AllocDialogState>({
    open: false,
    speciesId: '',
    seasonId: '',
    seasonName: '',
    nurseryQuantities: {},
  });

  // Derive active nursery filter from MRT column filter state
  const nurseriesFilter = useMemo(() => {
    const f = columnFilters.find((cf) => cf.id === 'nurseries');
    return (f?.value as string[]) ?? [];
  }, [columnFilters]);

  const handleFilterDateChange = (date: string) => {
    setFilterDate(date);
    if (!date) {
      setIncludedSeasonIds(new Set(nurseryPlanningSeasons.map((s) => s.id)));
    } else {
      setIncludedSeasonIds(
        new Set(nurseryPlanningSeasons.filter((s) => s.startDate <= date).map((s) => s.id))
      );
    }
  };

  const toggleSeason = (seasonId: string) => {
    setIncludedSeasonIds((prev) => {
      const next = new Set(prev);
      if (next.has(seasonId)) next.delete(seasonId);
      else next.add(seasonId);
      return next;
    });
  };

  const availableToAdd = species.filter((sp) => !activeSpeciesIds.includes(sp.id));

  const handleDeleteSpecies = (speciesId: string) => {
    setActiveSpeciesIds((prev) => prev.filter((id) => id !== speciesId));
    setNurserySeasonAllocs((prev) => {
      const next = { ...prev };
      delete next[speciesId];
      return next;
    });
  };

  // Get total effective allocated for a species+season (sum per-nursery overrides, or fall back to data)
  const getEffectiveAlloc = (speciesId: string, seasonId: string): number => {
    const nurseryAllocs = nurserySeasonAllocs[speciesId]?.[seasonId];
    if (nurseryAllocs !== undefined) {
      return Object.values(nurseryAllocs).reduce((s, v) => s + v, 0);
    }
    const alloc = getSeasonAllocationsForSpecies(speciesId).find((a) => a.seasonId === seasonId);
    return alloc?.allocated ?? 0;
  };

  // Get effective site allocation (edited value or fall back to data)
  const getEffectiveSiteAlloc = (speciesId: string, siteId: string): number => {
    return siteAllocationEdits[speciesId]?.[siteId] ??
      initialSiteAllocations.find((a) => a.speciesId === speciesId && a.siteId === siteId)?.allocated ?? 0;
  };

  const updateSiteAlloc = (speciesId: string, siteId: string, value: number) => {
    setSiteAllocationEdits((prev) => ({
      ...prev,
      [speciesId]: { ...(prev[speciesId] ?? {}), [siteId]: value },
    }));
  };

  const openAllocDialog = (speciesId: string, seasonId: string, seasonName: string) => {
    const existing = nurserySeasonAllocs[speciesId]?.[seasonId];
    const allNurseryNames = getNurseryNamesForSpecies(speciesId);
    // Show only nurseries matching the active filter (or all if no filter)
    const relevantNurseries =
      nurseriesFilter.length > 0
        ? allNurseryNames.filter((n) => nurseriesFilter.includes(n))
        : allNurseryNames;
    const quantities: Record<string, number> = {};
    for (const n of relevantNurseries) {
      quantities[n] = existing?.[n] ?? 0;
    }
    setDialogState({ open: true, speciesId, seasonId, seasonName, nurseryQuantities: quantities });
  };

  const saveAllocDialog = () => {
    setNurserySeasonAllocs((prev) => ({
      ...prev,
      [dialogState.speciesId]: {
        ...(prev[dialogState.speciesId] ?? {}),
        [dialogState.seasonId]: dialogState.nurseryQuantities,
      },
    }));
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  const qualifiedSeasonIds = includedSeasonIds;

  const tableData = useMemo<SpeciesRow[]>(
    () =>
      species.filter((sp) => activeSpeciesIds.includes(sp.id)).map((sp) => {
        const seasonAllocs = getSeasonAllocationsForSpecies(sp.id);
        const qualifiedAllocs = seasonAllocs.filter((a) => qualifiedSeasonIds.has(a.seasonId));

        const target = qualifiedAllocs.reduce((s, a) => s + a.target, 0);
        const allocated = qualifiedAllocs.reduce(
          (s, a) => s + getEffectiveAlloc(sp.id, a.seasonId),
          0
        );
        const totalInventory = getTotalInventoryForSpecies(sp.id);
        const progressPct = target > 0 ? (allocated / target) * 100 : 0;
        return {
          speciesId: sp.id,
          scientificName: sp.scientificName,
          commonName: sp.commonName,
          nurseries: getNurseryNamesForSpecies(sp.id).join(', '),
          allocated,
          totalInventory,
          remaining: target - allocated,
          target,
          progressPct,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeSpeciesIds, includedSeasonIds, nurserySeasonAllocs]
  );

  const summary = useMemo(() => {
    const totalAllocated = tableData.reduce((s, r) => s + r.allocated, 0);
    const totalTarget = tableData.reduce((s, r) => s + r.target, 0);
    const totalInNurseries = tableData.reduce((s, r) => s + r.totalInventory, 0);
    return { totalAllocated, totalTarget, totalInNurseries };
  }, [tableData]);

  const columns = useMemo<MRT_ColumnDef<SpeciesRow>[]>(
    () => [
      {
        accessorKey: 'scientificName',
        header: 'Species',
        enableColumnFilter: false,
        Cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: TEXT_PRIMARY }}>
            {row.original.scientificName} ({row.original.commonName})
          </Typography>
        ),
      },
      {
        accessorKey: 'nurseries',
        header: 'Nurseries',
        size: 110,
        filterVariant: 'multi-select' as const,
        filterSelectOptions: ['Waimea Nursery', 'Kona Nursery', 'Hilo Nursery'],
        filterFn: (row, _columnId, filterValue: string[]) => {
          if (!filterValue || filterValue.length === 0) return true;
          return filterValue.some((n) => row.original.nurseries.includes(n));
        },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontSize: '0.8rem', whiteSpace: 'normal', lineHeight: 1.4 }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'totalInventory',
        header: 'Total in Nurseries',
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'target',
        header: 'Requested',
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'allocated',
        header: 'Total Allocated',
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontWeight: 600 }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'remaining',
        header: 'Remaining to be Allocated',
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => {
          const val = cell.getValue<number>();
          return (
            <Typography
              variant="body2"
              sx={{ color: val < 0 ? COLOR_GAP : TEXT_SECONDARY, fontWeight: 500 }}
            >
              {val.toLocaleString()}
            </Typography>
          );
        },
      },
      {
        accessorKey: 'progressPct',
        header: 'Request Fulfilled',
        enableColumnFilter: false,
        Cell: ({ row }) => {
          const { allocated, target, progressPct } = row.original;
          const color = getProgressColor(allocated, target);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 160 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min(progressPct, 100)}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                }}
              />
              <Typography variant="caption" sx={{ color: TEXT_SECONDARY, minWidth: 36 }}>
                {Math.round(progressPct)}%
              </Typography>
            </Box>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 48,
        enableSorting: false,
        enableColumnFilter: false,
        muiTableBodyCellProps: { align: 'center', sx: { px: 0 } },
        Cell: ({ row }) => (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSpecies(row.original.speciesId);
            }}
            sx={{ color: TEXT_SECONDARY, '&:hover': { color: COLOR_GAP } }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    enableExpanding: true,
    enableExpandAll: true,
    renderDetailPanel: ({ row }) => {
      const siteAllocs = getAllocationsForSpecies(initialSiteAllocations, row.original.speciesId).filter((a) => a.target > 0);
      const totalInventory = getTotalInventoryForSpecies(row.original.speciesId);
      return (
        <Box sx={{ pl: 4, pr: 2, py: 0 }}>
          <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '25%' }}>
                  Planting Site
                </TableCell>
                <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '12%' }}>
                  Requested
                </TableCell>
                <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '15%' }}>
                  Allocated
                </TableCell>
                <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '14%' }}>
                  Remaining to be Allocated
                </TableCell>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}>
                  Fulfilled
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {siteAllocs.map((alloc) => {
                const site = plantingSites.find((s) => s.id === alloc.siteId);
                const target = alloc.target;
                const allocated = getEffectiveSiteAlloc(row.original.speciesId, alloc.siteId);
                const progressPct = target > 0 ? (allocated / target) * 100 : 0;
                const color = getProgressColor(allocated, target);
                return (
                  <SiteDetailRow
                    key={alloc.siteId}
                    siteName={site?.name ?? alloc.siteId}
                    target={target}
                    allocated={allocated}
                    totalInventory={totalInventory}
                    progressPct={progressPct}
                    progressColor={color}
                    onUpdate={(value) => updateSiteAlloc(row.original.speciesId, alloc.siteId, value)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </Box>
      );
    },
    renderBottomToolbar: ({ table }) => (
      <>
        <Box sx={{ borderTop: `1px solid ${BORDER_COLOR}`, px: 2, py: 1, bgcolor: '#fff' }}>
          {isAddingSpecies ? (
            <Autocomplete
              size="small"
              options={availableToAdd}
              getOptionLabel={(sp) => `${sp.scientificName} (${sp.commonName})`}
              onChange={(_, val) => {
                if (val) {
                  setActiveSpeciesIds((prev) => [...prev, val.id]);
                  setIsAddingSpecies(false);
                }
              }}
              onBlur={() => setIsAddingSpecies(false)}
              renderInput={(params) => (
                <TextField {...params} autoFocus placeholder="Select species..." />
              )}
              sx={{ minWidth: 380 }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: PRIMARY_GREEN,
                cursor: 'pointer',
                display: 'inline',
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={() => setIsAddingSpecies(true)}
            >
              + Show more species
            </Typography>
          )}
        </Box>
        <MRT_TablePagination table={table} />
      </>
    ),
    muiTablePaperProps: {
      sx: { border: `1px solid ${BORDER_COLOR}`, borderRadius: 1, boxShadow: 'none' },
    },
    muiTableHeadRowProps: { sx: { bgcolor: HEADER_BG } },
    muiTableHeadCellProps: {
      sx: { fontWeight: 600, color: TEXT_PRIMARY, borderBottom: `1px solid ${BORDER_COLOR}` },
    },
    muiTableBodyCellProps: { sx: { borderBottom: `1px solid ${BORDER_COLOR}` } },
    enableColumnFilters: true,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    initialState: { density: 'compact', showColumnFilters: true },
  });

  // Available inventory per nursery name for the allocation dialog
  const dialogNurseryInventory = useMemo(() => {
    if (!dialogState.speciesId) return {} as Record<string, number>;
    const inventoryItems = getNurseryInventoryForSpecies(dialogState.speciesId);
    const map: Record<string, number> = {};
    for (const item of inventoryItems) {
      const nursery = nurseriesData.find((n) => n.id === item.nurseryId);
      if (nursery) map[nursery.name] = item.quantity;
    }
    return map;
  }, [dialogState.speciesId]);

  const dialogSpecies = species.find((s) => s.id === dialogState.speciesId);
  const dialogTotal = Object.values(dialogState.nurseryQuantities).reduce((s, v) => s + v, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
        Nursery Inventory Planning
      </Typography>

      {/* Date filter */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          p: 2,
          bgcolor: '#fff',
          borderRadius: 1,
          border: `1px solid ${BORDER_COLOR}`,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>
          Requested by:
        </Typography>
        <TextField
          type="date"
          size="small"
          value={filterDate}
          onChange={(e) => handleFilterDateChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 180 }}
        />
        {(filterDate || includedSeasonIds.size < nurseryPlanningSeasons.length) && (
          <Typography
            variant="body2"
            sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => handleFilterDateChange('')}
          >
            Show All
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {nurseryPlanningSeasons.map((season) => {
            const included = includedSeasonIds.has(season.id);
            return (
              <Chip
                key={season.id}
                label={season.name}
                size="small"
                onClick={() => toggleSeason(season.id)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: included ? '#E6F4EC' : HEADER_BG,
                  color: included ? '#2E7D32' : TEXT_SECONDARY,
                  fontWeight: included ? 600 : 400,
                  fontSize: '0.75rem',
                  opacity: included ? 1 : 0.5,
                  '&:hover': { opacity: 0.85 },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Summary card */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 3,
          p: 2,
          bgcolor: '#fff',
          borderRadius: 1,
          border: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
              Total In Nurseries
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.1 }}>
              {summary.totalInNurseries.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0 }} />

          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
              Requested
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, color: summary.totalTarget > summary.totalInNurseries ? COLOR_GAP : TEXT_PRIMARY }}>
              {summary.totalTarget.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0 }} />

          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
              Total Allocated
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: getAllocatedStatusColor(summary.totalAllocated, summary.totalTarget), lineHeight: 1.1 }}>
              {summary.totalAllocated.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0 }} />

          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
              Remaining to be Allocated
            </Typography>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.1,
                color: getRemainingStatusColor(
                  summary.totalTarget - summary.totalAllocated,
                  summary.totalTarget
                ),
              }}
            >
              {(summary.totalTarget - summary.totalAllocated).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <MaterialReactTable table={table} />

      {/* Allocation Dialog */}
      <DialogBox
        open={dialogState.open}
        onClose={() => setDialogState((prev) => ({ ...prev, open: false }))}
        title="Allocate Plants"
        size="medium"
        scrolled
        middleButtons={[
          <Button
            key="cancel"
            label="Cancel"
            priority="secondary"
            onClick={() => setDialogState((prev) => ({ ...prev, open: false }))}
          />,
          <Button key="save" label="Save" onClick={saveAllocDialog} />,
        ]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {dialogSpecies && (
            <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontStyle: 'italic' }}>
              {dialogSpecies.scientificName} ({dialogSpecies.commonName}) — {dialogState.seasonName}
            </Typography>
          )}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: TEXT_SECONDARY, fontSize: '0.8rem' }}>
                  Nursery
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: TEXT_SECONDARY, fontSize: '0.8rem' }}>
                  Available
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: TEXT_SECONDARY, fontSize: '0.8rem' }}>
                  Qty to Allocate
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(dialogState.nurseryQuantities).map((nurseryName) => (
                <TableRow key={nurseryName}>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
                      {nurseryName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
                      {(dialogNurseryInventory[nurseryName] ?? 0).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={dialogState.nurseryQuantities[nurseryName]}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setDialogState((prev) => ({
                          ...prev,
                          nurseryQuantities: {
                            ...prev.nurseryQuantities,
                            [nurseryName]: isNaN(val) ? 0 : Math.max(0, val),
                          },
                        }));
                      }}
                      slotProps={{
                        htmlInput: { min: 0, step: 1, style: { textAlign: 'right' } },
                      }}
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              pt: 1,
              borderTop: `1px solid ${BORDER_COLOR}`,
            }}
          >
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontWeight: 600 }}>
              Total to Allocate: {dialogTotal.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </DialogBox>
    </Box>
  );
}

// --- Sub-component for editable site allocation rows in the detail panel ---

interface SiteDetailRowProps {
  siteName: string;
  target: number;
  allocated: number;
  totalInventory: number;
  progressPct: number;
  progressColor: string;
  onUpdate: (value: number) => void;
}

function SiteDetailRow({
  siteName,
  target,
  allocated,
  totalInventory,
  progressPct,
  progressColor,
  onUpdate,
}: SiteDetailRowProps) {
  const [localValue, setLocalValue] = useState(String(allocated));
  const [focused, setFocused] = useState(false);

  const handleChange = (raw: string) => {
    setLocalValue(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0) {
      onUpdate(num);
    }
  };

  const localNum = parseInt(localValue, 10);
  const effectiveAllocated = isNaN(localNum) || localNum < 0 ? allocated : localNum;
  const remaining = target - effectiveAllocated;

  return (
    <TableRow sx={{ '& td': { borderBottom: `1px solid ${BORDER_COLOR}` } }}>
      <TableCell>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
          {siteName}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
          {target.toLocaleString()}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <TextField
          size="small"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onClick={(e) => e.stopPropagation()}
          slotProps={{
            input: { sx: { fontSize: '0.85rem', py: 0 } },
            htmlInput: { style: { textAlign: 'right' } },
          }}
          sx={{ width: 90 }}
        />
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" sx={{ color: remaining < 0 ? COLOR_GAP : TEXT_SECONDARY }}>
          {remaining.toLocaleString()}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(progressPct, 100)}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: '#E0E0E0',
              '& .MuiLinearProgress-bar': { bgcolor: progressColor, borderRadius: 3 },
            }}
          />
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY, minWidth: 36 }}>
            {Math.round(progressPct)}%
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}
