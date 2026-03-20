import { Routes, Route, Navigate } from 'react-router';
import { AppShell } from '@/components/navigation';
import { PlanningHome } from './PlanningHome';

export default function PlantingPlanning2Prototype() {
  return (
    <AppShell>
      <Routes>
        <Route index element={<PlanningHome />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </AppShell>
  );
}
