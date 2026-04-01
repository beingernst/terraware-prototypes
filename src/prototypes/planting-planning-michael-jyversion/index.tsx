import { Routes, Route, Navigate } from 'react-router';
import { AppShell } from '@/components/navigation';
import type { NavSection } from '@/components/navigation';
import { PlanningHome } from './PlanningHome';
import { NurseryPlanning } from './NurseryPlanning';
import { PlantingSeasons } from './PlantingSeasons';
import {
  HomeOutlined as HomeIcon,
  SyncAlt as SpeciesIcon,
  GrainOutlined as SeedsIcon,
  SpaOutlined as SeedlingsIcon,
  ParkOutlined as PlantsIcon,
} from '@mui/icons-material';

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
          { label: 'Withdrawal Log', path: `${BASE}/withdrawal-log` },
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
        <Route path="nursery-planning" element={<NurseryPlanning />} />
        <Route path="planting-seasons" element={<PlantingSeasons />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </AppShell>
  );
}
