import { Routes, Route, Navigate } from 'react-router';
import { PrototypeHome } from './PrototypeHome';

export default function TemplatePrototype() {
  return (
    <Routes>
      <Route index element={<PrototypeHome />} />
      {/* Add more routes as needed */}
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
}
