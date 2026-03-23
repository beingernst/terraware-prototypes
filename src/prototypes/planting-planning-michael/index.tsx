import { Routes, Route, Navigate } from 'react-router';
import { AppShell } from '@/components/navigation';
import type { NavSection } from '@/components/navigation';
import { PlanningHome } from './PlanningHome';
import { NurseryPlanning } from './NurseryPlanning';
import {
  Home as HomeIcon,
  Sync as SpeciesIcon,
  Settings as SeedsIcon,
  Yard as SeedlingsIcon,
  Park as PlantsIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const sections: NavSection[] = [
  {
    items: [
      { label: 'Home', icon: <HomeIcon fontSize="small" />, path: '/prototypes/planting-planning' },
      { label: 'Species', icon: <SpeciesIcon fontSize="small" />, path: '/prototypes/planting-planning/species' },
    ],
    showDividerAfter: true,
  },
  {
    items: [
      { label: 'Seeds', icon: <SeedsIcon fontSize="small" />, path: '/prototypes/planting-planning/seeds' },
      {
        label: 'Seedlings',
        icon: <SeedlingsIcon fontSize="small" />,
        children: [
          { label: 'Inventory', path: '/prototypes/planting-planning/seedlings-inventory' },
          { label: 'Planning', path: '/prototypes/planting-planning/nursery-planning' },
          { label: 'Withdrawal Log', path: '/prototypes/planting-planning/withdrawal-log' },
        ],
      },
      { label: 'Plants', icon: <PlantsIcon fontSize="small" />, path: '/prototypes/planting-planning/plants' },
    ],
    showDividerAfter: true,
  },
  {
    items: [
      { label: 'Reports', icon: <ReportsIcon fontSize="small" />, path: '/prototypes/planting-planning/reports' },
      { label: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/prototypes/planting-planning/settings' },
    ],
  },
];

export default function PlantingPlanningPrototype() {
  return (
    <AppShell sections={sections}>
      <Routes>
        <Route index element={<PlanningHome />} />
        <Route path="nursery-planning" element={<NurseryPlanning />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </AppShell>
  );
}
