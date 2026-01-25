/**
 * AppShell Component
 *
 * Main layout wrapper providing the application structure:
 * - TopNav (fixed at top)
 * - Sidebar (fixed on left)
 * - Content area (scrollable main content)
 *
 * All prototypes are rendered inside the AppShell.
 */

import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { TopNav } from './TopNav';
import { Sidebar, TOP_NAV_HEIGHT } from './Sidebar';
import type { NavSection } from './Sidebar';

export interface AppShellProps {
  children: ReactNode;
  hideNavigation?: boolean;
  organizationName?: string;
  userName?: string;
  /** Custom navigation sections (replaces default sidebar nav) */
  sections?: NavSection[];
  /** Show/hide the language selector at bottom of sidebar */
  showLanguageSelector?: boolean;
}

export function AppShell({
  children,
  hideNavigation = false,
  organizationName,
  userName,
  sections,
  showLanguageSelector,
}: AppShellProps) {
  // If navigation is hidden, just render children directly
  if (hideNavigation) {
    return <>{children}</>;
  }

  return (
    // Full page wrapper with consistent background to avoid gaps
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'rgb(249, 248, 247)',
        backgroundImage: 'linear-gradient(180deg, rgba(226, 246, 236, 0) 0%, rgba(226, 246, 236, 0.4) 100%)',
      }}
    >
      {/* Top Navigation Bar */}
      <TopNav organizationName={organizationName} userName={userName} />

      {/* Left Sidebar */}
      <Sidebar
        sections={sections}
        showLanguageSelector={showLanguageSelector}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginTop: `${TOP_NAV_HEIGHT}px`,
          backgroundColor: 'transparent',
          minHeight: `calc(100vh - ${TOP_NAV_HEIGHT}px)`,
          px: 3,
          py: 2,
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
