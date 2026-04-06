import { Routes, Route, Navigate, useParams } from 'react-router';
import { AppShell } from '@/components/navigation';
import type { NavSection } from '@/components/navigation';
import { PlanningHome } from './PlanningHome';
import { NurseryPlanning } from './NurseryPlanning';
import { PlantingSeasons, WithdrawalLogView } from './PlantingSeasons';
import {
  HomeOutlined as HomeIcon,
  SyncAlt as SpeciesIcon,
  GrainOutlined as SeedsIcon,
  SpaOutlined as SeedlingsIcon,
  ParkOutlined as PlantsIcon,
} from '@mui/icons-material';

function PlantingSeasonDetail() {
  const { seasonId } = useParams<{ seasonId: string }>();
  return <PlantingSeasons initialSeasonId={seasonId} />;
}

function SeedlingsInventory() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: '#3A4445' }}>
        Seedlings Inventory
      </Typography>
      <Typography variant="body2" sx={{ color: '#6B7165', mt: 1 }}>
        Coming soon.
      </Typography>
    </Box>
  );
}

const BASE = '/prototypes/planting-planning-michael-jyversion';
const ICON_COLOR = '#7F785C';
const icon = (Icon: React.ComponentType<{ fontSize?: 'small'; sx?: object }>) => (
  <Icon fontSize="small" sx={{ color: ICON_COLOR }} />
);

const sections: NavSection[] = [
  {
    items: [
      { label: 'Home', icon: icon(HomeIcon), path: `${BASE}` },
      { label: 'Species', icon: icon(SpeciesIcon), path: `${BASE}/species` },
    ],
    showDividerAfter: true,
  },
  {
    items: [
      {
        label: 'Seeds',
        icon: icon(SeedsIcon),
        children: [
          { label: 'Accessions', path: `${BASE}/accessions` },
          { label: 'Seed Banks', path: `${BASE}/seed-banks` },
        ],
      },
    ],
    showDividerAfter: true,
  },
  {
    items: [
      {
        label: 'Seedlings',
        icon: icon(SeedlingsIcon),
        children: [
          { label: 'Inventory', path: `${BASE}/seedlings-inventory` },
          { label: 'Nursery Planning', path: `${BASE}/nursery-planning` },
          { label: 'Withdrawals', path: `${BASE}/withdrawal-log` },
        ],
      },
    ],
    showDividerAfter: true,
  },
  {
    items: [
      {
        label: 'Plants',
        icon: icon(PlantsIcon),
        children: [
          { label: 'Dashboard', path: `${BASE}/dashboard` },
          { label: 'Observations', path: `${BASE}/observations` },
          { label: 'Planting Seasons', path: `${BASE}/planting-seasons` },
        ],
      },
    ],
  },
];

export default function PlantingPlanningPrototype() {
  return (
    <AppShell sections={sections} alwaysExpanded>
      <Routes>
        <Route index element={<PlanningHome />} />
        <Route path="dashboard" element={<PlanningHome />} />
        <Route path="seedlings-inventory" element={<SeedlingsInventory />} />
        <Route path="nursery-planning" element={<NurseryPlanning />} />
        <Route path="planting-seasons" element={<PlantingSeasons />} />
        <Route path="planting-seasons/:seasonId" element={<PlantingSeasonDetail />} />
        <Route path="withdrawal-log" element={<WithdrawalLogView />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </AppShell>
  );
}
