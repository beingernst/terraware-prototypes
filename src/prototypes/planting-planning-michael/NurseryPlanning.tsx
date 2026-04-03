/**
 * Nursery Inventory Planning page.
 *
 * Cross-cutting view of nursery inventory vs planting demand, organized by Planting Site.
 */

import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import {
  plantingSites,
  nurseries as nurseriesData,
  getNurseryInventoryForSpecies,
  nurseryPlanningSeasons,
  initialSeasonAllocations,
  species,
  type Species,
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

function getAllocatedStatusColor(allocated: number, requested: number): string {
  if (requested === 0) return TEXT_PRIMARY;
  const pct = allocated / requested;
  if (pct >= 0.8) return COLOR_FULFILLED;
  if (pct >= 0.41) return COLOR_PARTIAL;
  if (pct <= 0.2) return COLOR_GAP;
  return TEXT_PRIMARY;
}

function getRemainingStatusColor(remaining: number, requested: number): string {
  if (requested === 0) return TEXT_PRIMARY;
  const pct = remaining / requested;
  if (pct <= 0.2) return COLOR_FULFILLED;
  if (pct >= 0.41 && pct <= 0.79) return COLOR_PARTIAL;
  if (pct >= 0.8) return COLOR_GAP;
  return TEXT_PRIMARY;
}

interface SiteRow {
  siteId: string;
  siteName: string;
  nurseryId: string;
  nurseryName: string;
  totalInNursery: number;
  totalRequested: number;
  totalAllocated: number;
  totalRemaining: number;
  progressPct: number;
}

interface SpeciesSeasonPair {
  speciesId: string;
  seasonId: string;
}

export function NurseryPlanning() {
  const [filterDate, setFilterDate] = useState('');
  const [includedSeasonIds, setIncludedSeasonIds] = useState<Set<string>>(
    () => new Set(nurseryPlanningSeasons.map((s) => s.id))
  );
  // allocOverrides[speciesId][seasonId] = overridden allocated value
  const [allocOverrides, setAllocOverrides] = useState<Record<string, Record<string, number>>>({});
  // Custom species×season rows per site (overrides the default derived from data)
  const [siteCustomRows, setSiteCustomRows] = useState<Record<string, SpeciesSeasonPair[]>>({});
  // Whether the "Add additional species" form is open per site
  const [showAddForm, setShowAddForm] = useState<Record<string, boolean>>({});
  // The selected species in the add form per site
  const [addFormSpecies, setAddFormSpecies] = useState<Record<string, Species | null>>({});
  const [notificationDismissed, setNotificationDismissed] = useState(false);

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

  const getEffectiveAlloc = (speciesId: string, seasonId: string): number => {
    if (allocOverrides[speciesId]?.[seasonId] !== undefined) {
      return allocOverrides[speciesId][seasonId];
    }
    const alloc = initialSeasonAllocations.find(
      (a) => a.speciesId === speciesId && a.seasonId === seasonId
    );
    return alloc?.allocated ?? 0;
  };

  // Returns the species×season rows for a site — custom list if set, otherwise derived from data
  const getEffectiveSiteSpeciesRows = (siteId: string): SpeciesSeasonPair[] => {
    if (siteCustomRows[siteId] !== undefined) {
      return siteCustomRows[siteId].filter((r) => includedSeasonIds.has(r.seasonId));
    }
    const siteSeasons = nurseryPlanningSeasons.filter(
      (s) => s.siteId === siteId && includedSeasonIds.has(s.id)
    );
    const rows: SpeciesSeasonPair[] = [];
    for (const season of siteSeasons) {
      const allocs = initialSeasonAllocations.filter((a) => a.seasonId === season.id);
      for (const alloc of allocs) {
        rows.push({ speciesId: alloc.speciesId, seasonId: season.id });
      }
    }
    return rows;
  };

  const handleDeleteRow = (siteId: string, speciesId: string, seasonId: string) => {
    const current = getEffectiveSiteSpeciesRows(siteId);
    setSiteCustomRows((prev) => ({
      ...prev,
      [siteId]: current.filter(
        (r) => !(r.speciesId === speciesId && r.seasonId === seasonId)
      ),
    }));
  };

  const handleAddRow = (siteId: string, sp: Species, seasonId: string) => {
    const current = getEffectiveSiteSpeciesRows(siteId);
    if (current.some((r) => r.speciesId === sp.id && r.seasonId === seasonId)) return;
    setSiteCustomRows((prev) => ({
      ...prev,
      [siteId]: [...current, { speciesId: sp.id, seasonId }],
    }));
    setShowAddForm((prev) => ({ ...prev, [siteId]: false }));
    setAddFormSpecies((prev) => ({ ...prev, [siteId]: null }));
  };

  const siteRows = useMemo<SiteRow[]>(() => {
    return plantingSites.flatMap((site) => {
      const siteSeasons = nurseryPlanningSeasons.filter(
        (s) => s.siteId === site.id && includedSeasonIds.has(s.id)
      );
      if (siteSeasons.length === 0) return [];

      const nurseryId = siteSeasons[0].nurseryId;
      const nursery = nurseriesData.find((n) => n.id === nurseryId);

      const speciesSeasonPairs = getEffectiveSiteSpeciesRows(site.id);
      const uniqueSpeciesIds = new Set(speciesSeasonPairs.map((r) => r.speciesId));

      let totalRequested = 0;
      let totalAllocated = 0;
      for (const pair of speciesSeasonPairs) {
        const alloc = initialSeasonAllocations.find(
          (a) => a.speciesId === pair.speciesId && a.seasonId === pair.seasonId
        );
        totalRequested += alloc?.target ?? 0;
        totalAllocated += getEffectiveAlloc(pair.speciesId, pair.seasonId);
      }

      const totalInNursery = [...uniqueSpeciesIds].reduce((sum, spId) => {
        const inv = getNurseryInventoryForSpecies(spId).find((i) => i.nurseryId === nurseryId);
        return sum + (inv?.quantity ?? 0);
      }, 0);

      return [{
        siteId: site.id,
        siteName: site.name,
        nurseryId,
        nurseryName: nursery?.name ?? '',
        totalInNursery,
        totalRequested,
        totalAllocated,
        totalRemaining: totalRequested - totalAllocated,
        progressPct: totalRequested > 0 ? (totalAllocated / totalRequested) * 100 : 0,
      }];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includedSeasonIds, allocOverrides, siteCustomRows]);

  const summary = useMemo(() => ({
    totalInNurseries: siteRows.reduce((s, r) => s + r.totalInNursery, 0),
    totalRequested: siteRows.reduce((s, r) => s + r.totalRequested, 0),
    totalAllocated: siteRows.reduce((s, r) => s + r.totalAllocated, 0),
  }), [siteRows]);

  const columns = useMemo<MRT_ColumnDef<SiteRow>[]>(() => [
    {
      accessorKey: 'siteName',
      header: 'Planting Site',
      enableColumnFilter: false,
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>
          {cell.getValue<string>()}
        </Typography>
      ),
    },
    {
      accessorKey: 'totalInNursery',
      header: 'Total in Nursery',
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
      accessorKey: 'totalRequested',
      header: 'Total Requested',
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
      accessorKey: 'totalAllocated',
      header: 'Total Allocated',
      enableColumnFilter: false,
      muiTableHeadCellProps: { align: 'right' },
      muiTableBodyCellProps: { align: 'right' },
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>
          {cell.getValue<number>().toLocaleString()}
        </Typography>
      ),
    },
    {
      accessorKey: 'totalRemaining',
      header: 'Total Remaining to be Allocated',
      enableColumnFilter: false,
      muiTableHeadCellProps: { align: 'right' },
      muiTableBodyCellProps: { align: 'right' },
      Cell: ({ cell }) => {
        const val = cell.getValue<number>();
        return (
          <Typography variant="body2" sx={{ color: val < 0 ? COLOR_GAP : TEXT_SECONDARY, fontWeight: 500 }}>
            {val.toLocaleString()}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'progressPct',
      header: 'Total Request Fulfilled',
      enableColumnFilter: false,
      Cell: ({ row }) => {
        const { totalAllocated, totalRequested, progressPct } = row.original;
        const color = getProgressColor(totalAllocated, totalRequested);
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
      accessorKey: 'nurseryName',
      header: 'Nursery',
      enableColumnFilter: false,
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontSize: '0.8rem' }}>
          {cell.getValue<string>()}
        </Typography>
      ),
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: siteRows,
    getRowId: (row) => row.siteId,
    enableExpanding: true,
    enableExpandAll: true,
    renderDetailPanel: ({ row }) => {
      const site = row.original;
      const detailRows = getEffectiveSiteSpeciesRows(site.siteId);
      const siteSeasons = nurseryPlanningSeasons.filter(
        (s) => s.siteId === site.siteId && includedSeasonIds.has(s.id)
      );
      const isAddOpen = showAddForm[site.siteId] ?? false;
      const selectedSpecies = addFormSpecies[site.siteId] ?? null;

      // Species not yet added for any season (available to add)
      const addedSpeciesIds = new Set(detailRows.map((r) => r.speciesId));
      const availableSpecies = species.filter((sp) => !addedSpeciesIds.has(sp.id));

      return (
        <Box sx={{ pl: 4, pr: 2, py: 0 }}>
          <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '21%' }}>
                  Species
                </TableCell>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '19%' }}>
                  Planting Season
                </TableCell>
                <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '11%' }}>
                  Requested
                </TableCell>
                <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '13%' }}>
                  Allocated
                </TableCell>
                <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '13%' }}>
                  Remaining to be Allocated
                </TableCell>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}>
                  Fulfilled
                </TableCell>
                <TableCell sx={{ width: 40 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {detailRows.map((detailRow) => {
                const sp = species.find((s) => s.id === detailRow.speciesId);
                const season = nurseryPlanningSeasons.find((s) => s.id === detailRow.seasonId);
                const alloc = initialSeasonAllocations.find(
                  (a) => a.speciesId === detailRow.speciesId && a.seasonId === detailRow.seasonId
                );
                const requested = alloc?.target ?? 0;
                const allocated = getEffectiveAlloc(detailRow.speciesId, detailRow.seasonId);
                const remaining = requested - allocated;
                const pct = requested > 0 ? (allocated / requested) * 100 : 0;
                const color = getProgressColor(allocated, requested);

                return (
                  <TableRow
                    key={`${detailRow.speciesId}-${detailRow.seasonId}`}
                    sx={{ '& td': { borderBottom: `1px solid ${BORDER_COLOR}` } }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: TEXT_PRIMARY, fontSize: '0.8rem' }}>
                        {sp?.scientificName ?? detailRow.speciesId}
                      </Typography>
                      <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
                        {sp?.commonName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontSize: '0.8rem' }}>
                        {season?.name ?? detailRow.seasonId}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
                        {requested.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={allocated}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setAllocOverrides((prev) => ({
                            ...prev,
                            [detailRow.speciesId]: {
                              ...(prev[detailRow.speciesId] ?? {}),
                              [detailRow.seasonId]: isNaN(val) ? 0 : Math.max(0, val),
                            },
                          }));
                        }}
                        slotProps={{
                          htmlInput: { min: 0, step: 1, style: { textAlign: 'right' } },
                        }}
                        sx={{ width: 90 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ color: remaining < 0 ? COLOR_GAP : TEXT_SECONDARY }}
                      >
                        {remaining.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(pct, 100)}
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#E0E0E0',
                            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: TEXT_SECONDARY, minWidth: 36 }}>
                          {Math.round(pct)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ px: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRow(site.siteId, detailRow.speciesId, detailRow.seasonId)}
                        sx={{ color: TEXT_SECONDARY, '&:hover': { color: COLOR_GAP } }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Add form row */}
              {isAddOpen && (
                <TableRow sx={{ '& td': { borderBottom: `1px solid ${BORDER_COLOR}` } }}>
                  <TableCell colSpan={2} sx={{ py: 1 }}>
                    <Autocomplete
                      size="small"
                      options={availableSpecies}
                      value={selectedSpecies}
                      getOptionLabel={(sp) => `${sp.scientificName} (${sp.commonName})`}
                      onChange={(_, val) =>
                        setAddFormSpecies((prev) => ({ ...prev, [site.siteId]: val }))
                      }
                      renderInput={(params) => (
                        <TextField {...params} autoFocus placeholder="Select species..." />
                      )}
                      sx={{ minWidth: 260 }}
                    />
                  </TableCell>
                  <TableCell colSpan={2} sx={{ py: 1 }}>
                    <TextField
                      select
                      size="small"
                      label="Planting Season"
                      disabled={!selectedSpecies}
                      defaultValue=""
                      onChange={(e) => {
                        if (selectedSpecies && e.target.value) {
                          handleAddRow(site.siteId, selectedSpecies, e.target.value);
                        }
                      }}
                      sx={{ minWidth: 180 }}
                    >
                      {siteSeasons.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell colSpan={2} />
                  <TableCell align="center" sx={{ px: 0 }}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setShowAddForm((prev) => ({ ...prev, [site.siteId]: false }));
                        setAddFormSpecies((prev) => ({ ...prev, [site.siteId]: null }));
                      }}
                      sx={{ color: TEXT_SECONDARY }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )}

              {/* Add additional species link */}
              {!isAddOpen && (
                <TableRow>
                  <TableCell colSpan={7} sx={{ borderBottom: 'none', pt: 1, pb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: PRIMARY_GREEN,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                      onClick={() =>
                        setShowAddForm((prev) => ({ ...prev, [site.siteId]: true }))
                      }
                    >
                      + Add additional species
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      );
    },
    muiTablePaperProps: {
      sx: { border: `1px solid ${BORDER_COLOR}`, borderRadius: 1, boxShadow: 'none' },
    },
    muiTableHeadRowProps: { sx: { bgcolor: HEADER_BG } },
    muiTableHeadCellProps: {
      sx: { fontWeight: 600, color: TEXT_PRIMARY, borderBottom: `1px solid ${BORDER_COLOR}` },
    },
    muiTableBodyCellProps: { sx: { borderBottom: `1px solid ${BORDER_COLOR}` } },
    enableColumnFilters: false,
    enableTopToolbar: false,
    enableBottomToolbar: false,
    enablePagination: false,
    initialState: { density: 'compact' },
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Notification bar */}
      {!notificationDismissed && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
            px: 2,
            py: 1.5,
            bgcolor: '#FFF8E1',
            border: '1px solid #FFD54F',
            borderRadius: 1,
          }}
        >
          <InfoIcon sx={{ color: '#F9A825', fontSize: 20, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, flex: 1 }}>
            A new planting season has been added:{' '}
            <strong>Nov - Mar 2026-27</strong> for Ocean View Lands.
          </Typography>
          <IconButton
            size="small"
            onClick={() => setNotificationDismissed(true)}
            sx={{ color: TEXT_SECONDARY }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

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
          Show requests for seasons starting by:
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
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.1 }}>
              {summary.totalRequested.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0 }} />

          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
              Total Allocated
            </Typography>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.1,
                color: getAllocatedStatusColor(summary.totalAllocated, summary.totalRequested),
              }}
            >
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
                  summary.totalRequested - summary.totalAllocated,
                  summary.totalRequested
                ),
              }}
            >
              {(summary.totalRequested - summary.totalAllocated).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <MaterialReactTable table={table} />
    </Box>
  );
}
