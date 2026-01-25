import { Routes, Route, Navigate } from 'react-router';
import { AppShell } from '@/components/navigation';
import { DashboardHome } from './DashboardHome';

export default function ExampleDashboard() {
  return (
    <AppShell>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </AppShell>
  );
}
