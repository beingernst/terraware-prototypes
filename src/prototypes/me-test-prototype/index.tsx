import { Routes, Route, Navigate } from 'react-router';
import { AppShell } from '@/components/navigation';
import type { NavSection } from '@/components/navigation';
import {
  Home as HomeIcon,
  CalendarMonth as PlanningIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { PrototypeHome } from './PrototypeHome';

// Custom navigation sections for M&E prototype
const meSections: NavSection[] = [
  {
    items: [
      { label: 'Home', icon: <HomeIcon fontSize="small" />, path: '/prototypes/me-test-prototype' },
      { label: 'Planning', icon: <PlanningIcon fontSize="small" />, path: '/prototypes/me-test-prototype/planning' },
      { label: 'Reports', icon: <ReportsIcon fontSize="small" />, path: '/prototypes/me-test-prototype/reports' },
    ],
    showDividerAfter: true,
  },
  {
    label: 'Configuration',
    items: [
      { label: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/prototypes/me-test-prototype/settings' },
    ],
  },
];

export default function METestPrototype() {
  return (
    <AppShell sections={meSections} showLanguageSelector={false}>
      <Routes>
        <Route index element={<PrototypeHome />} />
        {/* Add more routes as needed */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </AppShell>
  );
}
