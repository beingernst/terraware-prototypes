/**
 * Nursery Inventory Planning page.
 *
 * Cross-cutting view of nursery inventory vs planting demand across all sites and seasons.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Autocomplete,
  Box,
  Chip,
  LinearProgress,
  Popover,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import {
  MaterialReactTable,
  MRT_TablePagination,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table';
import {
  species,
  nurseries as nurseriesData,
  plantingSites,
  nurseryPlanningSeasons,
  siteSeasonTargets,
  getSiteSeasonTargets,
  getSiteSeasonTarget,
  getTotalInventoryForSpecies,
  getNurseryNamesForSpecies,
  getNurseryInventoryForSpecies,
  getSiteIdsForSpecies,
  type NurseryPlanningSeason,
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
  if (ratio >= 1)  return COLOR_FULFILLED;
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

type FulfillmentFilter = 'all' | 'fulfilled' | 'partial' | 'gap';

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
  siteIds: string[];
}

const today = new Date().toISOString().slice(0, 10);

export function NurseryPlanning() {
  const [filterDate, setFilterDate] = useState('');
  const [includedSeasonIds, setIncludedSeasonIds] = useState<Set<string>>(
    () => new Set(nurseryPlanningSeasons.filter((s) => s.endDate >= today).map((s) => s.id))
  );
  // Per-species per-season allocation edits: { [speciesId]: { [seasonId]: allocated } }
  const [seasonAllocEdits, setSeasonAllocEdits] = useState<Record<string, Record<string, number>>>({});

  const [seasonsExpanded, setSeasonsExpanded] = useState(false);

  // Filter toolbar state
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState<string[]>([]);
  const [nurseryFilter, setNurseryFilter] = useState<string[]>([]);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<FulfillmentFilter>('all');
  const [needsAttention, setNeedsAttention] = useState(false);

  const handleFilterDateChange = (date: string) => {
    setFilterDate(date);
    if (!date) {
      setIncludedSeasonIds(new Set(nurseryPlanningSeasons.filter((s) => s.endDate >= today).map((s) => s.id)));
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

  // Intersect user's chip selections with seasons belonging to the selected sites.
  // When no sites are selected, effectiveSeasonIds == includedSeasonIds.
  const effectiveSeasonIds = useMemo(() => {
    if (siteFilter.length === 0) return includedSeasonIds;
    const allowedIds = new Set(
      nurseryPlanningSeasons.filter((s) => siteFilter.includes(s.siteId)).map((s) => s.id)
    );
    return new Set([...includedSeasonIds].filter((id) => allowedIds.has(id)));
  }, [includedSeasonIds, siteFilter]);

  const getEffectiveSeasonAlloc = (speciesId: string, seasonId: string): number => {
    return seasonAllocEdits[speciesId]?.[seasonId]
      ?? getSiteSeasonTarget(speciesId, seasonId)?.allocated ?? 0;
  };

  const updateSeasonAlloc = (speciesId: string, seasonId: string, value: number) => {
    setSeasonAllocEdits((prev) => ({
      ...prev,
      [speciesId]: { ...(prev[speciesId] ?? {}), [seasonId]: value },
    }));
  };

  const tableData = useMemo<SpeciesRow[]>(() => {
    const visibleSpeciesIds = new Set(
      siteSeasonTargets
        .filter((t) => effectiveSeasonIds.has(t.seasonId) && t.target > 0)
        .map((t) => t.speciesId)
    );
    return species
      .filter((sp) => visibleSpeciesIds.has(sp.id))
      .map((sp) => {
        const targets = getSiteSeasonTargets(sp.id).filter((t) => effectiveSeasonIds.has(t.seasonId));
        const target = targets.reduce((s, t) => s + t.target, 0);
        const allocated = targets.reduce((s, t) => s + getEffectiveSeasonAlloc(sp.id, t.seasonId), 0);
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
          siteIds: getSiteIdsForSpecies(sp.id),
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSeasonIds, seasonAllocEdits]);

  // Apply custom filters
  const filteredTableData = useMemo(() => {
    return tableData.filter((row) => {
      // Species name search
      if (speciesSearch) {
        const q = speciesSearch.toLowerCase();
        if (
          !row.scientificName.toLowerCase().includes(q) &&
          !row.commonName.toLowerCase().includes(q)
        ) return false;
      }
      // Site filter
      if (siteFilter.length > 0) {
        if (!siteFilter.some((siteId) => row.siteIds.includes(siteId))) return false;
      }
      // Nursery filter
      if (nurseryFilter.length > 0) {
        if (!nurseryFilter.some((n) => row.nurseries.includes(n))) return false;
      }
      // Fulfillment filter
      if (fulfillmentFilter !== 'all') {
        const pct = row.target > 0 ? row.allocated / row.target : 1;
        if (fulfillmentFilter === 'fulfilled' && pct < 1) return false;
        if (fulfillmentFilter === 'partial' && (pct <= 0 || pct >= 1)) return false;
        if (fulfillmentFilter === 'gap' && pct > 0) return false;
      }
      // Needs attention: remaining > 0 or inventory < target
      if (needsAttention && row.remaining <= 0 && row.totalInventory >= row.target) return false;
      return true;
    });
  }, [tableData, speciesSearch, siteFilter, nurseryFilter, fulfillmentFilter, needsAttention]);

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
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontSize: '0.8rem', whiteSpace: 'normal', lineHeight: 1.4 }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'totalInventory',
        header: 'Inventory',
        size: 105,
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell, row }) => (
          <InventoryCell
            speciesId={row.original.speciesId}
            totalInventory={cell.getValue<number>()}
            isShort={row.original.target > row.original.totalInventory}
          />
        ),
      },
      {
        accessorKey: 'target',
        header: 'Requested',
        size: 90,
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell, row }) => (
          <Typography variant="body2" sx={{ color: row.original.target > row.original.totalInventory ? COLOR_GAP : TEXT_PRIMARY }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'allocated',
        header: 'Allocated',
        size: 90,
        enableColumnFilter: false,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell, row }) => (
          <Typography variant="body2" sx={{ color: getAllocatedStatusColor(row.original.allocated, row.original.target), fontWeight: 600 }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'remaining',
        header: 'Remaining to be Allocated',
        size: 110,
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
        minSize: 180,
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredTableData,
    enableExpanding: true,
    enableExpandAll: true,
    renderDetailPanel: ({ row }) => {
      // Get seasons in includedSeasonIds that have a target for this species, grouped by site
      const speciesTargets = getSiteSeasonTargets(row.original.speciesId);
      const relevantSeasons = nurseryPlanningSeasons.filter(
        (s) => effectiveSeasonIds.has(s.id) && speciesTargets.some((t) => t.seasonId === s.id && t.target > 0)
      );
      if (relevantSeasons.length === 0) return null;

      // Group seasons by siteId (preserving site order from plantingSites)
      const siteGroups: { site: typeof plantingSites[0]; seasons: NurseryPlanningSeason[] }[] = [];
      for (const site of plantingSites) {
        const siteSeasons = relevantSeasons.filter((s) => s.siteId === site.id);
        if (siteSeasons.length > 0) siteGroups.push({ site, seasons: siteSeasons });
      }

      return (
        <Box sx={{ pl: 4, pr: 2, py: 0 }}>
          <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '22%' }}>
                  Planting Site
                </TableCell>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '18%' }}>
                  Planting Season
                </TableCell>
                <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '12%' }}>
                  Requested
                </TableCell>
                <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '15%' }}>
                  Allocated
                </TableCell>
                <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '15%' }}>
                  Remaining to be Allocated
                </TableCell>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}>
                  Fulfilled
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {siteGroups.map(({ site, seasons }) =>
                seasons.map((season, idx) => {
                  const tgt = getSiteSeasonTarget(row.original.speciesId, season.id);
                  const target = tgt?.target ?? 0;
                  const allocated = getEffectiveSeasonAlloc(row.original.speciesId, season.id);
                  const progressPct = target > 0 ? (allocated / target) * 100 : 0;
                  const color = getProgressColor(allocated, target);
                  return (
                    <SiteSeasonDetailRow
                      key={season.id}
                      siteName={idx === 0 ? site.name : ''}
                      seasonId={season.id}
                      seasonName={season.name}
                      target={target}
                      allocated={allocated}
                      progressPct={progressPct}
                      progressColor={color}
                      onUpdate={(value) => updateSeasonAlloc(row.original.speciesId, season.id, value)}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
      );
    },
    renderBottomToolbar: ({ table }) => <MRT_TablePagination table={table} />,
    muiTablePaperProps: {
      sx: { border: `1px solid ${BORDER_COLOR}`, borderRadius: 1, boxShadow: 'none' },
    },
    muiTableHeadRowProps: { sx: { bgcolor: HEADER_BG } },
    muiTableHeadCellProps: {
      sx: { fontWeight: 600, color: TEXT_PRIMARY, borderBottom: `1px solid ${BORDER_COLOR}` },
    },
    muiTableBodyCellProps: { sx: { borderBottom: `1px solid ${BORDER_COLOR}` } },
    enableColumnFilters: false,
    initialState: { density: 'compact', showColumnFilters: false },
  });

  // Season chips grouped by site
  const seasonsBySite = useMemo(() => {
    return plantingSites
      .map((site) => ({
        site,
        seasons: nurseryPlanningSeasons.filter((s) => s.siteId === site.id),
      }))
      .filter(({ seasons }) => seasons.length > 0);
  }, []);

  // Seasons summary label for the collapsed toggle
  const activeSeasonIds = nurseryPlanningSeasons.filter((s) => s.endDate >= today).map((s) => s.id);
  const isDefaultSelection =
    activeSeasonIds.every((id) => includedSeasonIds.has(id)) &&
    includedSeasonIds.size === activeSeasonIds.length;
  const seasonsSummary =
    siteFilter.length === 0 && isDefaultSelection
      ? 'All active seasons'
      : `${effectiveSeasonIds.size} season${effectiveSeasonIds.size !== 1 ? 's' : ''}${siteFilter.length > 0 ? ` (${siteFilter.length} site${siteFilter.length !== 1 ? 's' : ''})` : ''}`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
        Nursery Inventory Planning
      </Typography>

      {/* Summary cards */}
      <Box
        sx={{
          display: 'flex',
          mb: 2,
          p: 2,
          bgcolor: '#fff',
          borderRadius: 1,
          border: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
            Inventory
          </Typography>
          <Link to="../seedlings-inventory" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <Typography sx={{ fontSize: 28, fontWeight: 600, color: PRIMARY_GREEN, lineHeight: 1.1 }}>
                {summary.totalInNurseries.toLocaleString()}
              </Typography>
              <OpenInNewIcon sx={{ fontSize: 14, color: PRIMARY_GREEN, mb: '2px' }} />
            </Box>
          </Link>
        </Box>

        <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0, alignSelf: 'center' }} />

        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
            Requested
          </Typography>
          <Link to="../planting-seasons" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
              <Typography sx={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, color: summary.totalTarget > summary.totalInNurseries ? COLOR_GAP : PRIMARY_GREEN }}>
                {summary.totalTarget.toLocaleString()}
              </Typography>
              <OpenInNewIcon sx={{ fontSize: 14, color: summary.totalTarget > summary.totalInNurseries ? COLOR_GAP : PRIMARY_GREEN, mb: '2px' }} />
            </Box>
          </Link>
        </Box>

        <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0, alignSelf: 'center' }} />

        <Box sx={{ flex: 1, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
            Allocated
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 600, color: getAllocatedStatusColor(summary.totalAllocated, summary.totalTarget), lineHeight: 1.1 }}>
            {summary.totalAllocated.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0, alignSelf: 'center' }} />

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

      {/* Unified filter toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: seasonsExpanded ? 0 : 1.5,
          flexWrap: 'wrap',
        }}
      >
        {/* Planting Site — drives which seasons are available */}
        <Autocomplete
          multiple
          size="small"
          options={plantingSites}
          getOptionLabel={(s) => s.name}
          value={plantingSites.filter((s) => siteFilter.includes(s.id))}
          onChange={(_, val) => setSiteFilter(val.map((s) => s.id))}
          renderInput={(params) => <TextField {...params} placeholder="Planting Site" />}
          sx={{ minWidth: 200 }}
          disableCloseOnSelect
        />

        {/* Seasons toggle — scoped by selected sites */}
        <Box
          onClick={() => setSeasonsExpanded((prev) => !prev)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            px: 1.5,
            py: 0.5,
            border: `1px solid ${seasonsExpanded ? PRIMARY_GREEN : BORDER_COLOR}`,
            borderRadius: 1,
            color: seasonsExpanded ? PRIMARY_GREEN : TEXT_SECONDARY,
            bgcolor: seasonsExpanded ? '#E6F4EC' : '#fff',
            '&:hover': { borderColor: PRIMARY_GREEN, color: PRIMARY_GREEN },
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: seasonsExpanded ? 600 : 400 }}>
            Seasons: {seasonsSummary}
          </Typography>
          {seasonsExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </Box>

        {/* Plants needed by date — further scopes seasons */}
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontWeight: 500, flexShrink: 0 }}>
          Plants needed by:
        </Typography>
        <TextField
          type="date"
          size="small"
          value={filterDate}
          onChange={(e) => handleFilterDateChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ width: 160 }}
        />

        {(filterDate || !isDefaultSelection) && (
          <Typography
            variant="body2"
            sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, flexShrink: 0 }}
            onClick={() => handleFilterDateChange('')}
          >
            Reset seasons
          </Typography>
        )}

        {/* Divider */}
        <Box sx={{ width: '1px', height: 24, bgcolor: BORDER_COLOR, flexShrink: 0 }} />

        <TextField
          size="small"
          placeholder="Search species..."
          value={speciesSearch}
          onChange={(e) => setSpeciesSearch(e.target.value)}
          sx={{ width: 200 }}
        />

        <Autocomplete
          multiple
          size="small"
          options={nurseriesData.map((n) => n.name)}
          value={nurseryFilter}
          onChange={(_, val) => setNurseryFilter(val)}
          renderInput={(params) => <TextField {...params} placeholder="Nursery" />}
          sx={{ minWidth: 180 }}
          disableCloseOnSelect
        />

        <Box sx={{ display: 'flex', border: `1px solid ${BORDER_COLOR}`, borderRadius: 1, overflow: 'hidden' }}>
          {([
            { opt: 'all',       label: 'All',       tip: 'Show all species' },
            { opt: 'fulfilled', label: 'Fulfilled',  tip: 'Species where allocated inventory meets or exceeds the target (100%)' },
            { opt: 'partial',   label: 'Partial',    tip: 'Species where some inventory is allocated but the target is not yet met' },
            { opt: 'gap',       label: 'Gap',        tip: 'Species with a target but zero inventory allocated' },
          ] as { opt: FulfillmentFilter; label: string; tip: string }[]).map(({ opt, label, tip }) => (
            <Tooltip key={opt} title={tip} placement="bottom" arrow>
              <Box
                onClick={() => setFulfillmentFilter(opt)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  bgcolor: fulfillmentFilter === opt ? PRIMARY_GREEN : '#fff',
                  color: fulfillmentFilter === opt ? '#fff' : TEXT_SECONDARY,
                  borderRight: opt !== 'gap' ? `1px solid ${BORDER_COLOR}` : 'none',
                  '&:hover': { bgcolor: fulfillmentFilter === opt ? PRIMARY_GREEN : HEADER_BG },
                  textTransform: 'capitalize',
                }}
              >
                {label}
              </Box>
            </Tooltip>
          ))}
        </Box>

        <Tooltip title="Species where the target hasn't been fully allocated, or the nursery doesn't have enough inventory to cover the target" placement="bottom" arrow>
          <ToggleButton
            value="needs-attention"
            selected={needsAttention}
            onChange={() => setNeedsAttention((prev) => !prev)}
            size="small"
            sx={{
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: 1,
              px: 1.5,
              fontSize: '0.8rem',
              textTransform: 'none',
              color: needsAttention ? '#fff' : TEXT_SECONDARY,
              bgcolor: needsAttention ? COLOR_GAP : '#fff',
              '&.Mui-selected': { bgcolor: COLOR_GAP, color: '#fff' },
              '&.Mui-selected:hover': { bgcolor: COLOR_GAP },
            }}
          >
            <WarningIcon sx={{ fontSize: 14, mr: 0.5 }} />
            Needs Attention
          </ToggleButton>
        </Tooltip>

        {(speciesSearch || siteFilter.length > 0 || nurseryFilter.length > 0 || fulfillmentFilter !== 'all' || needsAttention) && (
          <Typography
            variant="body2"
            sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => {
              setSpeciesSearch('');
              setSiteFilter([]);
              setNurseryFilter([]);
              setFulfillmentFilter('all');
              setNeedsAttention(false);
            }}
          >
            Clear filters
          </Typography>
        )}
      </Box>

      {/* Collapsible season chips */}
      {seasonsExpanded && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
            mb: 1.5,
            p: 1.5,
            bgcolor: '#fff',
            borderRadius: 1,
            border: `1px solid ${PRIMARY_GREEN}`,
          }}
        >
          {seasonsBySite
            .filter(({ site }) => siteFilter.length === 0 || siteFilter.includes(site.id))
            .map(({ site, seasons }) => (
            <Box key={site.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: TEXT_SECONDARY, minWidth: 120, fontWeight: 500 }}>
                {site.name}
              </Typography>
              {seasons.map((season) => {
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
          ))}
        </Box>
      )}

      <MaterialReactTable table={table} />
    </Box>
  );
}

// --- Sub-component for the clickable inventory number with nursery breakdown popover ---

function InventoryCell({ speciesId, totalInventory, isShort }: {
  speciesId: string;
  totalInventory: number;
  isShort: boolean;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const inventoryItems = getNurseryInventoryForSpecies(speciesId);

  return (
    <>
      <Typography
        variant="body2"
        onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{
          color: isShort ? COLOR_GAP : TEXT_PRIMARY,
          cursor: 'pointer',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: 3,
        }}
      >
        {totalInventory.toLocaleString()}
      </Typography>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { p: 1.5, minWidth: 160 } } }}
      >
        <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block', mb: 0.5 }}>
          Nursery breakdown
        </Typography>
        {inventoryItems.map((inv) => {
          const nursery = nurseriesData.find((n) => n.id === inv.nurseryId);
          return (
            <Box key={inv.nurseryId} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="body2">{nursery?.name ?? inv.nurseryId}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {inv.quantity.toLocaleString()}
              </Typography>
            </Box>
          );
        })}
      </Popover>
    </>
  );
}

// --- Sub-component for editable site × season rows in the detail panel ---

interface SiteSeasonDetailRowProps {
  siteName: string;       // empty string for non-first rows of same site
  seasonId: string;
  seasonName: string;
  target: number;
  allocated: number;
  progressPct: number;
  progressColor: string;
  onUpdate: (value: number) => void;
}

function SiteSeasonDetailRow({
  siteName,
  seasonId,
  seasonName,
  target,
  allocated,
  progressPct,
  progressColor,
  onUpdate,
}: SiteSeasonDetailRowProps) {
  const [localValue, setLocalValue] = useState(String(allocated));
  const [focused, setFocused] = useState(false);

  const handleChange = (raw: string) => {
    setLocalValue(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num >= 0 && num <= target) {
      onUpdate(num);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const num = parseInt(localValue, 10);
    if (!isNaN(num) && num > target) {
      setLocalValue(String(target));
      onUpdate(target);
    }
  };

  const localNum = parseInt(localValue, 10);
  const isOver = !isNaN(localNum) && localNum > target;
  const effectiveAllocated = isNaN(localNum) || localNum < 0 ? allocated : localNum;
  const remaining = target - effectiveAllocated;

  return (
    <TableRow sx={{ '& td': { borderBottom: `1px solid ${BORDER_COLOR}` } }}>
      <TableCell>
        {siteName && (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontWeight: 500 }}>
            {siteName}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <Link
          to={`../planting-seasons/${seasonId}`}
          style={{ textDecoration: 'underline', color: PRIMARY_GREEN, fontWeight: 500, fontSize: '0.875rem' }}
        >
          {seasonName}
        </Link>
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
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
          error={isOver}
          helperText={isOver ? `Max: ${target.toLocaleString()} (requested)` : undefined}
          slotProps={{
            input: { sx: { fontSize: '0.85rem', py: 0 } },
            htmlInput: { style: { textAlign: 'right' }, min: 0, max: target },
          }}
          sx={{ width: 90 }}
        />
      </TableCell>
      <TableCell align="right">
        <Typography
          variant="body2"
          sx={{
            color: !focused
              ? remaining < 0 ? COLOR_GAP : TEXT_SECONDARY
              : remaining < 0 ? COLOR_GAP : '#BDBDBD',
          }}
        >
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
