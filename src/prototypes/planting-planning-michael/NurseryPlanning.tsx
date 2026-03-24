/**
 * Nursery Inventory Planning page.
 *
 * Cross-cutting view of nursery inventory vs planting demand across all sites.
 */

import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  LinearProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Button, DialogBox } from '@terraware/web-components';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import type { SiteAllocation } from './nurseryPlanningData';
import {
  species,
  needByDates,
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
// Semantic colors for progress bars
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

export function NurseryPlanning() {
  const [selectedNeedByDateId, setSelectedNeedByDateId] = useState(needByDates[0].id);
  const [allocations, setAllocations] = useState<SiteAllocation[]>(() =>
    initialSiteAllocations.map((a) => ({ ...a }))
  );
  const [activeSpeciesIds, setActiveSpeciesIds] = useState<string[]>([
    'sp1', 'sp2', 'sp3', 'sp4', 'sp5',
  ]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);

  const availableToAdd = species.filter((sp) => !activeSpeciesIds.includes(sp.id));

  const handleAddSpecies = () => {
    if (selectedSpeciesId) {
      setActiveSpeciesIds((prev) => [...prev, selectedSpeciesId]);
      setSelectedSpeciesId(null);
      setAddDialogOpen(false);
    }
  };

  const tableData = useMemo<SpeciesRow[]>(
    () =>
      species.filter((sp) => activeSpeciesIds.includes(sp.id)).map((sp) => {
        const spAllocs = getAllocationsForSpecies(allocations, sp.id);
        const allocated = spAllocs.reduce((s, a) => s + a.allocated, 0);
        const target = spAllocs.reduce((s, a) => s + a.target, 0);
        const totalInventory = getTotalInventoryForSpecies(sp.id);
        const progressPct = target > 0 ? (allocated / target) * 100 : 0;
        return {
          speciesId: sp.id,
          scientificName: sp.scientificName,
          commonName: sp.commonName,
          nurseries: getNurseryNamesForSpecies(sp.id).join(', '),
          allocated,
          totalInventory,
          remaining: totalInventory - allocated,
          target,
          progressPct,
        };
      }),
    [allocations, activeSpeciesIds]
  );

  const summary = useMemo(() => {
    const totalAllocated = tableData.reduce((s, r) => s + r.allocated, 0);
    const totalTarget = tableData.reduce((s, r) => s + r.target, 0);
    const totalInNurseries = tableData.reduce((s, r) => s + r.totalInventory, 0);
    return { totalAllocated, totalTarget, totalInNurseries };
  }, [tableData]);

  const summaryProgress =
    summary.totalTarget > 0 ? (summary.totalAllocated / summary.totalTarget) * 100 : 0;

  const updateAllocation = (speciesId: string, siteId: string, value: number) => {
    setAllocations((prev) =>
      prev.map((a) =>
        a.speciesId === speciesId && a.siteId === siteId ? { ...a, allocated: value } : a
      )
    );
  };

  const getOverAllocationError = (
    speciesId: string,
    siteId: string,
    newValue: number
  ): string | null => {
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

  const columns = useMemo<MRT_ColumnDef<SpeciesRow>[]>(
    () => [
      {
        accessorKey: 'scientificName',
        header: 'Species',
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: TEXT_PRIMARY }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'commonName',
        header: 'Common Name',
      },
      {
        accessorKey: 'nurseries',
        header: 'Nurseries',
        size: 160,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontSize: '0.8rem' }}>
            {cell.getValue<string>()}
          </Typography>
        ),
      },
      {
        accessorKey: 'allocated',
        header: 'Allocated',
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontWeight: 600 }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'totalInventory',
        header: 'Total in Nursery',
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'remaining',
        header: 'Remaining',
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
        accessorKey: 'target',
        header: 'Target',
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'progressPct',
        header: 'Request Fulfilled',
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
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
          Need by
        </Typography>
        <Select
          size="small"
          value={selectedNeedByDateId}
          onChange={(e) => setSelectedNeedByDateId(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {needByDates.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
    ),
    enableExpanding: true,
    enableExpandAll: true,
    renderDetailPanel: ({ row }) => {
      const spAllocs = getAllocationsForSpecies(allocations, row.original.speciesId);
      return (
        <Box sx={{ pl: 4, pr: 2, py: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}>
                  Site
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Allocated
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Target
                </TableCell>
                <TableCell
                  sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, minWidth: 160 }}
                >
                  Fulfilled
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spAllocs.map((alloc) => {
                const site = plantingSites.find((s) => s.id === alloc.siteId);
                return (
                  <SiteAllocationRow
                    key={alloc.siteId}
                    siteName={site?.name ?? alloc.siteId}
                    allocation={alloc}
                    totalInventory={row.original.totalInventory}
                    totalAllocated={row.original.allocated}
                    onUpdate={(value) =>
                      updateAllocation(row.original.speciesId, alloc.siteId, value)
                    }
                    getError={(value) =>
                      getOverAllocationError(row.original.speciesId, alloc.siteId, value)
                    }
                  />
                );
              })}
            </TableBody>
          </Table>
        </Box>
      );
    },
    muiTablePaperProps: {
      sx: { border: `1px solid ${BORDER_COLOR}`, borderRadius: 1, boxShadow: 'none' },
    },
    muiTableHeadRowProps: {
      sx: { bgcolor: HEADER_BG },
    },
    muiTableHeadCellProps: {
      sx: { fontWeight: 600, color: TEXT_PRIMARY, borderBottom: `1px solid ${BORDER_COLOR}` },
    },
    muiTableBodyCellProps: {
      sx: { borderBottom: `1px solid ${BORDER_COLOR}` },
    },
    initialState: { density: 'compact' },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
        Nursery Inventory Planning
      </Typography>

      {/* Summary row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 3,
          p: 2,
          bgcolor: HEADER_BG,
          borderRadius: 1,
          border: `1px solid ${BORDER_COLOR}`,
        }}
      >
        {/* Progress bar + Add button row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(summaryProgress, 100)}
              sx={{
                height: 20,
                borderRadius: 4,
                bgcolor: '#E0E0E0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getProgressColor(summary.totalAllocated, summary.totalTarget),
                  borderRadius: 4,
                },
              }}
            />
          </Box>
          <Button
            label="+ Add species"
            onClick={() => setAddDialogOpen(true)}
            priority="secondary"
          />
        </Box>

        {/* Metrics row */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Allocated */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
              Allocated
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.1 }}>
              {summary.totalAllocated.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0 }} />

          {/* In Nurseries */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
              In Nurseries
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.1 }}>
              {summary.totalInNurseries.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0 }} />

          {/* Remaining */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
              Remaining
            </Typography>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.1,
                color: summary.totalInNurseries - summary.totalAllocated < 0 ? COLOR_GAP : TEXT_PRIMARY,
              }}
            >
              {(summary.totalInNurseries - summary.totalAllocated).toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ width: '1px', height: 48, bgcolor: BORDER_COLOR, flexShrink: 0 }} />

          {/* Target */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, display: 'block' }}>
              Target
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.1 }}>
              {summary.totalTarget.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>

      <MaterialReactTable table={table} />

      <DialogBox
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="Add Species"
        size="medium"
        middleButtons={[
          <Button key="cancel" label="Cancel" onClick={() => setAddDialogOpen(false)} priority="secondary" />,
          <Button key="add" label="Add" onClick={handleAddSpecies} disabled={!selectedSpeciesId} />,
        ]}
      >
        <Autocomplete
          options={availableToAdd}
          getOptionLabel={(sp) => `${sp.scientificName} (${sp.commonName})`}
          onChange={(_, val) => setSelectedSpeciesId(val?.id ?? null)}
          renderInput={(params) => (
            <TextField {...params} label="Species" autoFocus sx={{ mt: 1 }} />
          )}
        />
      </DialogBox>
    </Box>
  );
}

// --- Sub-components ---

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
  onUpdate,
  getError,
}: SiteAllocationRowProps) {
  const [localValue, setLocalValue] = useState(String(allocation.allocated));
  const [error, setError] = useState<string | null>(null);

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

  const progressPct =
    allocation.target > 0 ? (allocation.allocated / allocation.target) * 100 : 0;
  const progressColor = getProgressColor(allocation.allocated, allocation.target);

  return (
    <>
      <TableRow
        sx={{ '& td': { borderBottom: error ? 'none' : `1px solid ${BORDER_COLOR}` } }}
      >
        <TableCell>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
            {siteName}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <TextField
            size="small"
            type="number"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            error={!!error}
            onClick={(e) => e.stopPropagation()}
            slotProps={{
              input: { sx: { fontSize: '0.85rem', py: 0 } },
              htmlInput: { min: 0, step: 1 },
            }}
            sx={{ width: 90 }}
          />
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
            {allocation.target.toLocaleString()}
          </Typography>
        </TableCell>
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
      {error && (
        <TableRow>
          <TableCell
            colSpan={4}
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
