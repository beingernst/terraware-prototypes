/**
 * Planting Seasons screen.
 *
 * Tabs: Planting Progress | Planting Seasons
 * Planting Seasons tab: create/list seasons, add targets per species per stratum.
 */

import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

// Colors
const HEADER_BG = '#F5F5F0';
const TEXT_PRIMARY = '#3A4445';
const TEXT_SECONDARY = '#6B7165';
const BORDER_COLOR = '#E8E5E0';
const PRIMARY_GREEN = '#4A7C59';
const COLOR_GAP = '#F44336';

// --- Mock data ---

const plantingSites = [
  { id: 'site1', name: 'Montanha do Sul' },
  { id: 'site2', name: "Pu'u Wa'awa'a" },
  { id: 'site3', name: 'Mauna Meadows' },
];

const strata = [
  { id: 'st1', name: 'Black-White-East' },
  { id: 'st2', name: 'Black-White-West' },
];

const speciesList = [
  { id: 'sp1', scientificName: 'Dodonaea viscosa', commonName: "A'ali'i" },
  { id: 'sp2', scientificName: 'Acacia koa', commonName: 'Koa' },
  { id: 'sp3', scientificName: 'Metrosideros polymorpha', commonName: "'Ohi'a Lehua" },
  { id: 'sp4', scientificName: 'Sophora chrysophylla', commonName: 'Mamane' },
  { id: 'sp5', scientificName: 'Myoporum sandwicense', commonName: 'Naio' },
];

// --- Types ---

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface StratumTarget {
  speciesId: string;
  stratumId: string;
  target: number;
  readyToPlant: number;
  withdrawn: number;
}

interface SpeciesRow {
  speciesId: string;
  scientificName: string;
  commonName: string;
  target: number;
  readyToPlant: number;
  withdrawn: number;
  remaining: number;
}

// --- Helpers ---

function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return '';
  const fmt = (d: string) =>
    d
      ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function makeInitialStratumTargets(): StratumTarget[] {
  return speciesList.flatMap((sp) =>
    strata.map((st) => ({
      speciesId: sp.id,
      stratumId: st.id,
      target: 0,
      readyToPlant: Math.floor(Math.random() * 80 + 10),
      withdrawn: Math.floor(Math.random() * 30),
    }))
  );
}

// --- Add Targets sub-screen ---

function AddTargetsView({ season, onBack }: { season: Season; onBack: () => void }) {
  const [stratumTargets, setStratumTargets] = useState<StratumTarget[]>(makeInitialStratumTargets);

  const getStratumTargets = (speciesId: string) =>
    stratumTargets.filter((t) => t.speciesId === speciesId);

  const updateTarget = (speciesId: string, stratumId: string, value: number) => {
    setStratumTargets((prev) =>
      prev.map((t) =>
        t.speciesId === speciesId && t.stratumId === stratumId ? { ...t, target: value } : t
      )
    );
  };

  const tableData = useMemo<SpeciesRow[]>(
    () =>
      speciesList.map((sp) => {
        const spTargets = getStratumTargets(sp.id);
        const target = spTargets.reduce((s, t) => s + t.target, 0);
        const readyToPlant = spTargets.reduce((s, t) => s + t.readyToPlant, 0);
        const withdrawn = spTargets.reduce((s, t) => s + t.withdrawn, 0);
        return {
          speciesId: sp.id,
          scientificName: sp.scientificName,
          commonName: sp.commonName,
          target,
          readyToPlant,
          withdrawn,
          remaining: target - withdrawn,
        };
      }),
    [stratumTargets]
  );

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
        accessorKey: 'target',
        header: 'Target to Plant',
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY, fontWeight: 600 }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'readyToPlant',
        header: 'Ready to Plant',
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            {cell.getValue<number>().toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: 'withdrawn',
        header: 'Withdrawn for Planting',
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
        header: 'Remaining to Plant',
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell: ({ cell }) => {
          const val = cell.getValue<number>();
          return (
            <Typography
              variant="body2"
              sx={{ color: val < 0 ? COLOR_GAP : TEXT_PRIMARY, fontWeight: 500 }}
            >
              {val.toLocaleString()}
            </Typography>
          );
        },
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
      const spTargets = getStratumTargets(row.original.speciesId);
      return (
        <Box sx={{ pl: 4, pr: 2, py: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}>
                  Stratum
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Target to Plant
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Ready to Plant
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Withdrawn
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  Remaining
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {spTargets.map((st) => {
                const stratum = strata.find((s) => s.id === st.stratumId);
                const remaining = st.target - st.withdrawn;
                return (
                  <TableRow key={st.stratumId} sx={{ '& td': { borderBottom: `1px solid ${BORDER_COLOR}` } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
                        {stratum?.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={st.target}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 0) {
                            updateTarget(row.original.speciesId, st.stratumId, val);
                          }
                        }}
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
                        {st.readyToPlant.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
                        {st.withdrawn.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ color: remaining < 0 ? COLOR_GAP : TEXT_SECONDARY }}
                      >
                        {remaining.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
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
    muiTableHeadRowProps: { sx: { bgcolor: HEADER_BG } },
    muiTableHeadCellProps: {
      sx: { fontWeight: 600, color: TEXT_PRIMARY, borderBottom: `1px solid ${BORDER_COLOR}` },
    },
    muiTableBodyCellProps: { sx: { borderBottom: `1px solid ${BORDER_COLOR}` } },
    initialState: { density: 'compact' },
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Back breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
        <IconButton size="small" onClick={onBack} sx={{ color: TEXT_SECONDARY }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="body2"
          sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={onBack}
        >
          Planting Seasons
        </Typography>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 0.5 }}>
        {season.name}
      </Typography>
      {season.startDate && season.endDate && (
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mb: 3 }}>
          {formatDateRange(season.startDate, season.endDate)}
        </Typography>
      )}

      <MaterialReactTable table={table} />
    </Box>
  );
}

// --- Season card ---

interface SeasonCardProps {
  season: Season;
  onAddTargets: () => void;
}

function SeasonCard({ season, onAddTargets }: SeasonCardProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        mb: 2,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: 1,
        bgcolor: '#fff',
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 0.5 }}>
        {season.name}
      </Typography>
      {season.startDate && season.endDate && (
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mb: 1.5 }}>
          {formatDateRange(season.startDate, season.endDate)}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {strata.map((st) => (
          <Chip
            key={st.id}
            label={st.name}
            size="small"
            sx={{ bgcolor: HEADER_BG, color: TEXT_SECONDARY, fontSize: '0.75rem' }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
          Target: <em>Not set yet</em>
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={onAddTargets}
          sx={{
            color: PRIMARY_GREEN,
            borderColor: PRIMARY_GREEN,
            textTransform: 'none',
            '&:hover': { borderColor: '#3D6B4A', color: '#3D6B4A', bgcolor: 'transparent' },
          }}
        >
          Add Targets
        </Button>
      </Box>
    </Box>
  );
}

// --- Main component ---

export function PlantingSeasons() {
  const [activeTab, setActiveTab] = useState(1); // 0 = Progress, 1 = Seasons
  const [selectedSiteId, setSelectedSiteId] = useState('site1');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [addTargetsSeason, setAddTargetsSeason] = useState<Season | null>(null);

  const handleCreateSeason = () => {
    if (!newSeasonName.trim()) return;
    setSeasons((prev) => [
      ...prev,
      {
        id: `season-${Date.now()}`,
        name: newSeasonName.trim(),
        startDate: newStartDate,
        endDate: newEndDate,
      },
    ]);
    setNewSeasonName('');
    setNewStartDate('');
    setNewEndDate('');
    setCreateDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setNewSeasonName('');
    setNewStartDate('');
    setNewEndDate('');
    setCreateDialogOpen(false);
  };

  // Show Add Targets sub-screen
  if (addTargetsSeason) {
    return <AddTargetsView season={addTargetsSeason} onBack={() => setAddTargetsSeason(null)} />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
        Planting
      </Typography>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, mb: 3 }}
        TabIndicatorProps={{ sx: { bgcolor: PRIMARY_GREEN } }}
      >
        <Tab label="Planting Progress" sx={{ textTransform: 'none' }} />
        <Tab label="Planting Seasons" sx={{ textTransform: 'none' }} />
      </Tabs>

      {/* Planting Site selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>
          Planting Site:
        </Typography>
        <Select
          size="small"
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {plantingSites.map((site) => (
            <MenuItem key={site.id} value={site.id}>
              {site.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Planting Seasons tab */}
      {activeTab === 1 && (
        <>
          {seasons.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 10,
              }}
            >
              <Typography variant="body1" sx={{ color: TEXT_SECONDARY, mb: 3 }}>
                You have not set up any planting seasons
              </Typography>
              <Button
                variant="contained"
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  bgcolor: PRIMARY_GREEN,
                  '&:hover': { bgcolor: '#3D6B4A' },
                  textTransform: 'none',
                }}
              >
                Add Planting Season
              </Button>
            </Box>
          ) : (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setCreateDialogOpen(true)}
                  sx={{
                    bgcolor: PRIMARY_GREEN,
                    '&:hover': { bgcolor: '#3D6B4A' },
                    textTransform: 'none',
                  }}
                >
                  Add Planting Season
                </Button>
              </Box>
              {seasons.map((season) => (
                <SeasonCard
                  key={season.id}
                  season={season}
                  onAddTargets={() => setAddTargetsSeason(season)}
                />
              ))}
            </Box>
          )}
        </>
      )}

      {/* Planting Progress tab — placeholder */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <Typography variant="body1" sx={{ color: TEXT_SECONDARY }}>
            Planting Progress coming soon
          </Typography>
        </Box>
      )}

      {/* Create Season Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create Planting Season</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '20px !important' }}>
          <TextField
            label="Name"
            value={newSeasonName}
            onChange={(e) => setNewSeasonName(e.target.value)}
            fullWidth
            autoFocus
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Date"
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateSeason}
            disabled={!newSeasonName.trim()}
            variant="contained"
            sx={{
              bgcolor: PRIMARY_GREEN,
              '&:hover': { bgcolor: '#3D6B4A' },
              textTransform: 'none',
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
