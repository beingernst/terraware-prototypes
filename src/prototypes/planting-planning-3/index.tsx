/**
 * Planting Planning Prototype V3
 *
 * This prototype allows users to:
 * 1. Set up planting seasons using a Gantt chart
 * 2. Plan species distribution across zones
 * 3. Track planting density targets and progress
 *
 * Flow:
 * - Start with empty state on "Plan" screen
 * - Create planting seasons and define timing
 * - Drill into a season to plan species assignments
 * - Monitor planting density targets
 */

import { Routes, Route, Navigate, useLocation } from 'react-router';
import { GlobalStyles } from '@mui/material';
import { useEffect } from 'react';
import { AppShell } from '@/components/navigation';
import type { NavSection } from '@/components/navigation';
import {
  Dashboard as DashboardIcon,
  Sync as SpeciesIcon,
  Assignment as DiligenceIcon,
  Description as DocumentationIcon,
  Assessment as ReportsIcon,
  Settings as SeedsIcon,
  Yard as NurseryIcon,
  Park as PlantingIcon,
} from '@mui/icons-material';

import PlanScreen from './PlanScreen';
import ProgressScreen from './ProgressScreen';
import PlanSeasonDetail from './PlanSeasonDetail';

// Custom navigation sections matching planting planning structure
const customNavSections: NavSection[] = [
  // Top items: Dashboard, Species
  {
    items: [
      { label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/prototypes/planting-planning-3' },
      { label: 'Species', icon: <SpeciesIcon fontSize="small" />, path: '/prototypes/planting-planning-3' },
    ],
  },
  // Diligence, Documentation, Reports (no section header)
  {
    items: [
      { label: 'Diligence', icon: <DiligenceIcon fontSize="small" />, path: '/prototypes/planting-planning-3' },
      { label: 'Documentation', icon: <DocumentationIcon fontSize="small" />, path: '/prototypes/planting-planning-3' },
      { label: 'Reports', icon: <ReportsIcon fontSize="small" />, path: '/prototypes/planting-planning-3' },
    ],
  },
  // Seeds - COLLAPSED
  {
    items: [
      {
        label: 'Seeds',
        icon: <SeedsIcon fontSize="small" />,
        children: [
          { label: 'Accessions', path: '/prototypes/planting-planning-3' },
        ],
      },
    ],
  },
  // Nursery - COLLAPSED
  {
    items: [
      {
        label: 'Nursery',
        icon: <NurseryIcon fontSize="small" />,
        children: [
          { label: 'Inventory', path: '/prototypes/planting-planning-3' },
          { label: 'Withdrawal Log', path: '/prototypes/planting-planning-3' },
        ],
      },
    ],
  },
  // Planting - with Sites, Plans, Progress, Monitoring Data
  {
    items: [
      {
        label: 'Planting',
        icon: <PlantingIcon fontSize="small" />,
        children: [
          { label: 'Sites', path: '/prototypes/planting-planning-3' },
          { label: 'Plans', path: '/prototypes/planting-planning-3/plan' },
          { label: 'Progress', path: '/prototypes/planting-planning-3/progress' },
          { label: 'Monitoring Data', path: '/prototypes/planting-planning-3' },
        ],
      },
    ],
  },
];

export default function PlantingPlanning3Prototype() {
  const location = useLocation();

  // Determine which child item is active
  const isOnPlanPage = location.pathname.includes('/plan');
  const isOnProgressPage = location.pathname.endsWith('/progress');

  // Auto-expand Planting section on mount
  useEffect(() => {
    // Find and click the Planting section to expand it
    const timer = setTimeout(() => {
      const plantingButton = Array.from(document.querySelectorAll('.MuiListItemText-primary'))
        .find(el => el.textContent === 'Planting')
        ?.closest('.MuiListItemButton-root') as HTMLElement;

      if (plantingButton && !plantingButton.nextElementSibling) {
        // Only click if not already expanded (no collapse element visible)
        plantingButton.click();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <GlobalStyles
        styles={{
          /* Remove green background from all navigation items by default */
          '.MuiDrawer-root .MuiListItemButton-root': {
            backgroundColor: 'transparent !important',
          },
          '.MuiDrawer-root .MuiListItemButton-root:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04) !important',
          },
          /* Highlight the active child item under Planting */
          /* Sites = nth-child(1), Plans = nth-child(2), Progress = nth-child(3), Monitoring Data = nth-child(4) */
          ...(isOnPlanPage && {
            '.MuiDrawer-root .MuiCollapse-root .MuiList-root .MuiListItem-root:nth-child(2) .MuiListItemButton-root': {
              backgroundColor: '#DEE5D9 !important',
              borderRadius: '8px !important',
              marginLeft: '8px !important',
              marginRight: '8px !important',
            },
            '.MuiDrawer-root .MuiCollapse-root .MuiList-root .MuiListItem-root:nth-child(2) .MuiListItemButton-root:hover': {
              backgroundColor: '#DEE5D9 !important',
            },
          }),
          ...(isOnProgressPage && {
            '.MuiDrawer-root .MuiCollapse-root .MuiList-root .MuiListItem-root:nth-child(3) .MuiListItemButton-root': {
              backgroundColor: '#DEE5D9 !important',
              borderRadius: '8px !important',
              marginLeft: '8px !important',
              marginRight: '8px !important',
            },
            '.MuiDrawer-root .MuiCollapse-root .MuiList-root .MuiListItem-root:nth-child(3) .MuiListItemButton-root:hover': {
              backgroundColor: '#DEE5D9 !important',
            },
          }),
        }}
      />
      <AppShell sections={customNavSections} showLanguageSelector={false}>
        <Routes>
          <Route index element={<Navigate to="plan" replace />} />
          <Route path="plan" element={<PlanScreen />} />
          <Route path="progress" element={<ProgressScreen />} />
          <Route path="plan/:seasonId" element={<PlanSeasonDetail />} />
          <Route path="*" element={<Navigate to="plan" replace />} />
        </Routes>
      </AppShell>
    </>
  );
}
