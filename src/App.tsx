/**
 * Main Application Component
 *
 * This is the root component that sets up:
 * - Theme provider (MUI + Terraware design tokens)
 * - Router for navigation between prototypes
 * - AppShell layout (TopNav + Sidebar + content area)
 *
 * All prototypes are rendered inside the AppShell, giving them
 * the production-like navigation automatically.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { StyledEngineProvider } from '@mui/material/styles';
import { prototypeTheme } from './design-system/theme';

// Import prototypes as they're created
import ExampleDashboard from './prototypes/example-dashboard';
import METestPrototype from './prototypes/me-test-prototype';
import PlantingPlanningPrototype from './prototypes/planting-planning';
import PlantingPlanning2Prototype from './prototypes/planting-planning-2';
import PlantingPlanning3Prototype from './prototypes/planting-planning-3';
import PlantingPlanningMichaelPrototype from './prototypes/planting-planning-michael';
import PlantingPlanningMichaelJYPrototype from './prototypes/planting-planning-michael-jyversion';

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={prototypeTheme}>
        <CssBaseline />
        <BrowserRouter>
          {/* Each prototype manages its own AppShell for custom navigation */}
          <Routes>
            <Route path="/" element={<Navigate to="/prototypes/example-dashboard" replace />} />
            <Route path="/prototypes/example-dashboard/*" element={<ExampleDashboard />} />
            <Route path="/prototypes/me-test-prototype/*" element={<METestPrototype />} />
            <Route path="/prototypes/planting-planning/*" element={<PlantingPlanningPrototype />} />
            <Route path="/prototypes/planting-planning-2/*" element={<PlantingPlanning2Prototype />} />
            <Route path="/prototypes/planting-planning-3/*" element={<PlantingPlanning3Prototype />} />
            <Route path="/prototypes/planting-planning-michael/*" element={<PlantingPlanningMichaelPrototype />} />
            <Route path="/prototypes/planting-planning-michael-jyversion/*" element={<PlantingPlanningMichaelJYPrototype />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
