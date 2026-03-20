/**
 * Nursery Inventory Planning page.
 *
 * Cross-cutting view of nursery inventory vs planting demand across all sites.
 */

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import type { SiteAllocation } from './nurseryPlanningData';
import {
  species,
  plantingSeasons,
  plantingSites,
  initialSiteAllocations,
  getAllocationsForSpecies,
  getTotalInventoryForSpecies,
  getNurseryNamesForSpecies,
} from './nurseryPlanningData';

// Colors
const HEADER_BG = '#F5F5F0';
const TEXT_PRIMARY = '#3A4445';
const TEXT_SECONDARY = '#6B7165';
const BORDER_COLOR = '#E8E5E0';
const PRIMARY_GREEN = '#4A7C59';

// Semantic colors for progress bars
const COLOR_FULFILLED = '#4CAF50';
const COLOR_PARTIAL = '#FF9800';
const COLOR_GAP = '#F44336';

function getProgressColor(allocated: number, target: number): string {
  if (target === 0) return COLOR_FULFILLED;
  const ratio = allocated / target;
  if (ratio >= 1) return COLOR_FULFILLED;
  if (ratio > 0) return COLOR_PARTIAL;
  return COLOR_GAP;
}

export function NurseryPlanning() {
  const [selectedSeasonId, setSelectedSeasonId] = useState(plantingSeasons[0].id);
  const [allocations, setAllocations] = useState<SiteAllocation[]>(() =>
    initialSiteAllocations.map((a) => ({ ...a }))
  );
  const [expandedSpecies, setExpandedSpecies] = useState<Set<string>>(new Set());

  const selectedSeason = plantingSeasons.find((s) => s.id === selectedSeasonId)!;

  // Summary calculations
  const summary = useMemo(() => {
    let totalAllocated = 0;
    let totalTarget = 0;
    let totalInNurseries = 0;

    for (const sp of species) {
      const spAllocs = getAllocationsForSpecies(allocations, sp.id);
      totalAllocated += spAllocs.reduce((s, a) => s + a.allocated, 0);
      totalTarget += spAllocs.reduce((s, a) => s + a.target, 0);
      totalInNurseries += getTotalInventoryForSpecies(sp.id);
    }

    return { totalAllocated, totalTarget, totalInNurseries };
  }, [allocations]);

  const summaryProgress = summary.totalTarget > 0 ? (summary.totalAllocated / summary.totalTarget) * 100 : 0;

  const toggleExpanded = (speciesId: string) => {
    setExpandedSpecies((prev) => {
      const next = new Set(prev);
      if (next.has(speciesId)) next.delete(speciesId);
      else next.add(speciesId);
      return next;
    });
  };

  const updateAllocation = (speciesId: string, siteId: string, value: number) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.speciesId === speciesId && a.siteId === siteId ? { ...a, allocated: value } : a
      )
    );
  };

  // Check if a given allocation change would exceed inventory
  const getOverAllocationError = (speciesId: string, siteId: string, newValue: number): string | null => {
    const totalInventory = getTotalInventoryForSpecies(speciesId);
    const spAllocs = getAllocationsForSpecies(allocations, speciesId);
    const otherAllocated = spAllocs
      .filter((a) => a.siteId !== siteId)
      .reduce((s, a) => s + a.allocated, 0);

    if (otherAllocated + newValue > totalInventory) {
      return 'Not enough inventory. Reduce allocation at another site to free up plants.';
    }
    return null;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200 }}>
      {/* Title */}
      <Typography variant="h5" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
        Nursery Inventory Planning
      </Typography>

      {/* Season selector row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Select
          size="small"
          value={selectedSeasonId}
          onChange={(e) => setSelectedSeasonId(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {plantingSeasons.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.label}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
          {selectedSeason.plantingDates} Planting Dates
        </Typography>
      </Box>

      {/* Summary row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mb: 3,
          p: 2,
          bgcolor: HEADER_BG,
          borderRadius: 1,
          border: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(summaryProgress, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: '#E0E0E0',
              '& .MuiLinearProgress-bar': {
                bgcolor: getProgressColor(summary.totalAllocated, summary.totalTarget),
                borderRadius: 4,
              },
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, whiteSpace: 'nowrap' }}>
          <strong>{summary.totalAllocated.toLocaleString()}</strong> Allocated
        </Typography>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, whiteSpace: 'nowrap' }}>
          <strong>{summary.totalInNurseries.toLocaleString()}</strong> In Nurseries
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: summary.totalInNurseries - summary.totalAllocated < 0 ? COLOR_GAP : TEXT_SECONDARY,
            whiteSpace: 'nowrap',
          }}
        >
          <strong>{(summary.totalInNurseries - summary.totalAllocated).toLocaleString()}</strong> Remaining
        </Typography>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, whiteSpace: 'nowrap' }}>
          <strong>{summary.totalTarget.toLocaleString()}</strong> Target
        </Typography>
        <Box sx={{ flex: '0 0 auto' }}>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: PRIMARY_GREEN,
              textTransform: 'none',
              '&:hover': { bgcolor: '#3D6B4A' },
            }}
          >
            Allocate Plants
          </Button>
        </Box>
      </Box>

      {/* Species table */}
      <TableContainer
        sx={{
          border: `1px solid ${BORDER_COLOR}`,
          borderRadius: 1,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: HEADER_BG }}>
              <TableCell sx={{ width: 40 }} />
              <TableCell sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>Species</TableCell>
              <TableCell sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>Common Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>Nurseries</TableCell>
              <TableCell sx={{ fontWeight: 600, color: TEXT_PRIMARY }} align="right">
                Allocated
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: TEXT_PRIMARY }} align="right">
                Total in Nursery
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: TEXT_PRIMARY }} align="right">
                Remaining
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: TEXT_PRIMARY }} align="right">
                Target
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: TEXT_PRIMARY, minWidth: 160 }}>
                Request Fulfilled
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {species.map((sp) => {
              const spAllocs = getAllocationsForSpecies(allocations, sp.id);
              const totalAllocated = spAllocs.reduce((s, a) => s + a.allocated, 0);
              const totalTarget = spAllocs.reduce((s, a) => s + a.target, 0);
              const totalInventory = getTotalInventoryForSpecies(sp.id);
              const nurseryNames = getNurseryNamesForSpecies(sp.id);
              const isExpanded = expandedSpecies.has(sp.id);
              const progressPct = totalTarget > 0 ? (totalAllocated / totalTarget) * 100 : 0;
              const progressColor = getProgressColor(totalAllocated, totalTarget);

              return (
                <SpeciesRow
                  key={sp.id}
                  scientificName={sp.scientificName}
                  commonName={sp.commonName}
                  nurseryNames={nurseryNames}
                  totalInventory={totalInventory}
                  totalAllocated={totalAllocated}
                  totalTarget={totalTarget}
                  progressPct={progressPct}
                  progressColor={progressColor}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpanded(sp.id)}
                  siteAllocations={spAllocs}
                  onUpdateAllocation={(siteId, value) => updateAllocation(sp.id, siteId, value)}
                  getError={(siteId, value) => getOverAllocationError(sp.id, siteId, value)}
                />
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// --- Sub-components ---

interface SpeciesRowProps {
  scientificName: string;
  commonName: string;
  nurseryNames: string[];
  totalInventory: number;
  totalAllocated: number;
  totalTarget: number;
  progressPct: number;
  progressColor: string;
  isExpanded: boolean;
  onToggle: () => void;
  siteAllocations: SiteAllocation[];
  onUpdateAllocation: (siteId: string, value: number) => void;
  getError: (siteId: string, value: number) => string | null;
}

function SpeciesRow({
  scientificName,
  commonName,
  nurseryNames,
  totalInventory,
  totalAllocated,
  totalTarget,
  progressPct,
  progressColor,
  isExpanded,
  onToggle,
  siteAllocations,
  onUpdateAllocation,
  getError,
}: SpeciesRowProps) {
  return (
    <>
      <TableRow
        hover
        onClick={onToggle}
        sx={{ cursor: 'pointer', '& td': { borderBottom: `1px solid ${BORDER_COLOR}` } }}
      >
        <TableCell sx={{ width: 40, px: 1 }}>
          <IconButton size="small">
            {isExpanded ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: TEXT_PRIMARY }}>
            {scientificName}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            {commonName}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontSize: '0.8rem' }}>
            {nurseryNames.join(', ')}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontWeight: 600 }}>
            {totalAllocated.toLocaleString()}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            {totalInventory.toLocaleString()}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography
            variant="body2"
            sx={{
              color: totalInventory - totalAllocated < 0 ? COLOR_GAP : TEXT_SECONDARY,
              fontWeight: 500,
            }}
          >
            {(totalInventory - totalAllocated).toLocaleString()}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            {totalTarget.toLocaleString()}
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

      {/* Expanded sub-rows — rendered directly in the same table for column alignment */}
      {isExpanded &&
        siteAllocations.map((alloc) => {
          const site = plantingSites.find((s) => s.id === alloc.siteId);
          return (
            <SiteAllocationRow
              key={alloc.siteId}
              siteName={site?.name ?? alloc.siteId}
              allocation={alloc}
              totalInventory={totalInventory}
              totalAllocated={totalAllocated}
              onUpdate={(value) => onUpdateAllocation(alloc.siteId, value)}
              getError={(value) => getError(alloc.siteId, value)}
            />
          );
        })}
    </>
  );
}

interface SiteAllocationRowProps {
  siteName: string;
  allocation: SiteAllocation;
  totalInventory: number;
  totalAllocated: number;
  onUpdate: (value: number) => void;
  getError: (value: number) => string | null;
}

function SiteAllocationRow({
  siteName,
  allocation,
  totalInventory,
  totalAllocated,
  onUpdate,
  getError,
}: SiteAllocationRowProps) {
  const [localValue, setLocalValue] = useState(String(allocation.allocated));
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (raw: string) => {
    setLocalValue(raw);
    const num = parseInt(raw, 10);
    if (isNaN(num) || num < 0) {
      setError('Enter a valid number');
      return;
    }
    const err = getError(num);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onUpdate(num);
  };

  // Compute remaining using the local input value so it reflects attempted over-allocations
  const localNum = parseInt(localValue, 10);
  const effectiveLocal = isNaN(localNum) || localNum < 0 ? allocation.allocated : localNum;
  const remaining = totalInventory - (totalAllocated - allocation.allocated + effectiveLocal);
  const progressPct = allocation.target > 0 ? (allocation.allocated / allocation.target) * 100 : 0;
  const progressColor = getProgressColor(allocation.allocated, allocation.target);

  return (
    <>
      <TableRow sx={{ bgcolor: '#FAFAFA', '& td': { borderBottom: error ? 'none' : `1px solid ${BORDER_COLOR}` } }}>
        {/* Expand icon — empty */}
        <TableCell sx={{ width: 40 }} />
        {/* Species — site name indented */}
        <TableCell sx={{ pl: 4 }}>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
            {siteName}
          </Typography>
        </TableCell>
        {/* Common Name — empty */}
        <TableCell />
        {/* Nurseries — empty */}
        <TableCell />
        {/* Allocated — editable */}
        <TableCell align="right">
          <TextField
            size="small"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            error={!!error}
            onClick={(e) => e.stopPropagation()}
            slotProps={{
              input: { sx: { fontSize: '0.85rem', py: 0, textAlign: 'right' } },
            }}
            sx={{ width: 90 }}
          />
        </TableCell>
        {/* Total in Nursery — shown when focused */}
        <TableCell align="right">
          {focused && (
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
              {totalInventory.toLocaleString()}
            </Typography>
          )}
        </TableCell>
        {/* Remaining — shown when focused, red + negative when over-allocated */}
        <TableCell align="right">
          {focused && (
            <Typography
              variant="body2"
              sx={{ color: remaining < 0 ? COLOR_GAP : '#B0B0B0' }}
            >
              {remaining.toLocaleString()}
            </Typography>
          )}
        </TableCell>
        {/* Target */}
        <TableCell align="right">
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
            {allocation.target.toLocaleString()}
          </Typography>
        </TableCell>
        {/* Request Fulfilled — progress bar + percentage; grey with no % when over-allocated */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={error ? 100 : Math.min(progressPct, 100)}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: '#E0E0E0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: error ? '#D5D5D5' : progressColor,
                  borderRadius: 3,
                },
              }}
            />
            {!error && (
              <Typography variant="caption" sx={{ color: TEXT_SECONDARY, minWidth: 36 }}>
                {Math.round(progressPct)}%
              </Typography>
            )}
          </Box>
        </TableCell>
      </TableRow>
      {/* Error row spanning Allocated through Request Fulfilled */}
      {error && (
        <TableRow sx={{ bgcolor: '#FAFAFA' }}>
          <TableCell sx={{ width: 40, py: 0, borderBottom: `1px solid ${BORDER_COLOR}` }} />
          <TableCell sx={{ py: 0, borderBottom: `1px solid ${BORDER_COLOR}` }} />
          <TableCell sx={{ py: 0, borderBottom: `1px solid ${BORDER_COLOR}` }} />
          <TableCell sx={{ py: 0, borderBottom: `1px solid ${BORDER_COLOR}` }} />
          <TableCell
            colSpan={5}
            sx={{ pt: 0, pb: 0.5, borderBottom: `1px solid ${BORDER_COLOR}` }}
          >
            <Typography variant="caption" sx={{ color: COLOR_GAP, fontSize: '0.75rem' }}>
              {error}
            </Typography>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
