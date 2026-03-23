import { Routes, Route, Navigate } from 'react-router';
import { AppShell } from '@/components/navigation';
import type { NavSection } from '@/components/navigation';
import { PlanningHome } from './PlanningHome';
import { NurseryPlanning } from './NurseryPlanning';
import { PlantingSeasons } from './PlantingSeasons';
import {
  Home as HomeIcon,
  Sync as SpeciesIcon,
  Settings as SeedsIcon,
  Yard as SeedlingsIcon,
  Park as PlantsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const BASE = '/prototypes/planting-planning-michael';

const sections: NavSection[] = [
  {
    items: [
      { label: 'Home', icon: <HomeIcon fontSize="small" />, path: `${BASE}` },
      { label: 'Species', icon: <SpeciesIcon fontSize="small" />, path: `${BASE}/species` },
    ],
    showDividerAfter: true,
  },
  {
    items: [
      { label: 'Seeds', icon: <SeedsIcon fontSize="small" />, path: `${BASE}/seeds` },
      {
        label: 'Seedlings',
        icon: <SeedlingsIcon fontSize="small" />,
        children: [
          { label: 'Inventory', path: `${BASE}/seedlings-inventory` },
          { label: 'Planning', path: `${BASE}/nursery-planning` },
          { label: 'Withdrawal Log', path: `${BASE}/withdrawal-log` },
        ],
      },
      { label: 'Plants', icon: <PlantsIcon fontSize="small" />, path: `${BASE}/plants` },
      {
        label: 'Planting',
        icon: <PlantsIcon fontSize="small" />,
        children: [
          { label: 'Dashboard', path: `${BASE}/planting-dashboard` },
          { label: 'Observation', path: `${BASE}/planting-observation` },
          { label: 'Planting Progress', path: `${BASE}/planting-seasons` },
        ],
      },
    ],
    showDividerAfter: true,
  },
  {
    items: [
      { label: 'Reports', icon: <ReportsIcon fontSize="small" />, path: `${BASE}/reports` },
      { label: 'Settings', icon: <SettingsIcon fontSize="small" />, path: `${BASE}/settings` },
    ],
  },
];

export default function PlantingPlanningPrototype() {
  return (
    <AppShell sections={sections}>
      <Routes>
        <Route index element={<PlanningHome />} />
        <Route path="nursery-planning" element={<NurseryPlanning />} />
        <Route path="planting-seasons" element={<PlantingSeasons />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </AppShell>
  );
}
