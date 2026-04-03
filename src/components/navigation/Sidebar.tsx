/**
 * Sidebar Component
 *
 * This is the left navigation sidebar that appears on all pages.
 * Styling matches the production Terraware app.
 */

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Divider,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Home as HomeIcon,
  Sync as SpeciesIcon,
  Description as ApplicationIcon,
  Send as DeliverablesIcon,
  ViewModule as ModulesIcon,
  EventNote as ActivityLogIcon,
  Assessment as ReportsIcon,
  Settings as SeedsIcon,
  Yard as SeedlingsIcon,
  Park as PlantsIcon,
  Business as OrganizationIcon,
  Groups as PeopleIcon,
  Folder as ProjectsIcon,
  MyLocation as LocationsIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';

// Sidebar width
export const SIDEBAR_WIDTH = 200;

// Top nav height (30px content + 30px padding)
export const TOP_NAV_HEIGHT = 60;

// Custom colors to match production
const ACTIVE_BG = '#DEE5D9'; // Cooler sage green for active state
const ICON_COLOR = '#6B7165'; // Muted greenish-gray for icons
const TEXT_COLOR = '#3A4445'; // Main text color
const SECTION_HEADER_COLOR = '#9CA3A0';
const BORDER_COLOR = '#E8E5E0';
const BADGE_BG = '#C45D4A'; // Reddish brown for NEW badge

// Navigation item type definition - exported for custom nav configs
export interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
  badge?: string; // Optional badge like "NEW"
}

// Navigation section type
export interface NavSection {
  label?: string; // Section header (optional)
  items: NavItem[];
  showDividerAfter?: boolean;
}

// Props for configurable sidebar
export interface SidebarProps {
  sections?: NavSection[];
  showLanguageSelector?: boolean;
  /** Keep all expandable sections open, disabling collapse toggle */
  alwaysExpanded?: boolean;
}

// Default navigation sections matching production
const defaultSections: NavSection[] = [
  {
    // Top section: Home, Species
    items: [
      { label: 'Home', icon: <HomeIcon fontSize="small" />, path: '/prototypes/example-dashboard' },
      { label: 'Species', icon: <SpeciesIcon fontSize="small" />, path: '/species' },
    ],
    showDividerAfter: true,
  },
  {
    // Accelerator section
    label: 'Accelerator',
    items: [
      { label: 'Application', icon: <ApplicationIcon fontSize="small" />, path: '/accelerator/application', badge: 'NEW' },
      { label: 'Deliverables', icon: <DeliverablesIcon fontSize="small" />, path: '/accelerator/deliverables' },
      { label: 'Modules', icon: <ModulesIcon fontSize="small" />, path: '/accelerator/modules' },
      { label: 'Activity Log', icon: <ActivityLogIcon fontSize="small" />, path: '/accelerator/activity-log' },
      { label: 'Reports', icon: <ReportsIcon fontSize="small" />, path: '/accelerator/reports' },
    ],
    showDividerAfter: true,
  },
  {
    // Seeds, Seedlings, Plants (expandable)
    items: [
      {
        label: 'Seeds',
        icon: <SeedsIcon fontSize="small" />,
        children: [
          { label: 'Seed Banks', path: '/seeds/seed-banks' },
          { label: 'Accessions', path: '/seeds/accessions' },
        ],
      },
      {
        label: 'Seedlings',
        icon: <SeedlingsIcon fontSize="small" />,
        children: [
          { label: 'Inventory', path: '/seedlings/inventory' },
          { label: 'Withdrawal Log', path: '/seedlings/withdrawal-log' },
        ],
      },
      {
        label: 'Plants',
        icon: <PlantsIcon fontSize="small" />,
        children: [
          { label: 'Planting Sites', path: '/plants/planting-sites' },
          { label: 'Observations', path: '/plants/observations' },
        ],
      },
    ],
    showDividerAfter: true,
  },
  {
    // Settings section
    label: 'Settings',
    items: [
      { label: 'Organization', icon: <OrganizationIcon fontSize="small" />, path: '/settings/organization' },
      { label: 'People', icon: <PeopleIcon fontSize="small" />, path: '/settings/people' },
      { label: 'Projects', icon: <ProjectsIcon fontSize="small" />, path: '/settings/projects' },
      {
        label: 'Locations',
        icon: <LocationsIcon fontSize="small" />,
        children: [
          { label: 'Seed Banks', path: '/settings/locations/seed-banks' },
          { label: 'Nurseries', path: '/settings/locations/nurseries' },
        ],
      },
    ],
  },
];

export function Sidebar({
  sections = defaultSections,
  showLanguageSelector = true,
  alwaysExpanded = false,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('English');

  // Track which expandable sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Toggle expandable section
  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Check if a path is currently active
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  // Render a badge (like "NEW")
  const renderBadge = (badge: string) => (
    <Box
      sx={{
        backgroundColor: BADGE_BG,
        color: 'white',
        fontSize: '9px',
        fontWeight: 600,
        px: 0.75,
        py: 0.25,
        borderRadius: '4px',
        ml: 1,
        textTransform: 'uppercase',
      }}
    >
      {badge}
    </Box>
  );

  // Render a single navigation item
  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = alwaysExpanded || openSections[item.label];
    const active = item.path ? isActive(item.path) : false;

    return (
      <Box key={item.label}>
        <ListItem disablePadding sx={{ px: 1, mb: 0.25 }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                toggleSection(item.label);
              } else if (item.path) {
                navigate(item.path);
              }
            }}
            sx={{
              py: 0.75,
              px: 1.5,
              minHeight: 36,
              backgroundColor: active ? ACTIVE_BG : 'transparent',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: active ? ACTIVE_BG : 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 28,
                color: ICON_COLOR,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span>{item.label}</span>
                  {item.badge && renderBadge(item.badge)}
                </Box>
              }
              primaryTypographyProps={{
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                color: TEXT_COLOR,
              }}
            />
            {hasChildren && (
              <Box sx={{ color: ICON_COLOR, display: 'flex', alignItems: 'center' }}>
                {isOpen ? (
                  <KeyboardArrowUp sx={{ fontSize: 18 }} />
                ) : (
                  <KeyboardArrowDown sx={{ fontSize: 18 }} />
                )}
              </Box>
            )}
          </ListItemButton>
        </ListItem>

        {/* Render children if this item has them */}
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => {
                const childActive = isActive(child.path);
                return (
                  <ListItem key={child.label} disablePadding sx={{ px: 1, mb: 0.25 }}>
                    <ListItemButton
                      onClick={() => navigate(child.path)}
                      sx={{
                        py: 0.5,
                        pl: 5,
                        pr: 1.5,
                        minHeight: 32,
                        borderRadius: '8px',
                        backgroundColor: childActive ? ACTIVE_BG : 'transparent',
                        '&:hover': {
                          backgroundColor: childActive ? ACTIVE_BG : 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={child.label}
                        primaryTypographyProps={{
                          fontSize: '13px',
                          fontWeight: childActive ? 500 : 400,
                          color: TEXT_COLOR,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  // Render a section header
  const renderSectionHeader = (label: string) => (
    <Typography
      sx={{
        px: 2.5,
        pt: 1.5,
        pb: 0.5,
        fontSize: '10px',
        fontWeight: 600,
        color: SECTION_HEADER_COLOR,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {label}
    </Typography>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
          borderRight: 'none',
          top: TOP_NAV_HEIGHT,
          height: `calc(100% - ${TOP_NAV_HEIGHT}px)`,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Navigation Sections */}
      <Box sx={{ flex: 1, overflowY: 'auto', pt: 1 }}>
        {sections.map((section, index) => (
          <Box key={index}>
            {/* Section header if present */}
            {section.label && renderSectionHeader(section.label)}

            {/* Section items */}
            <List sx={{ pt: section.label ? 0 : 0.5, pb: 0 }}>
              {section.items.map((item) => renderNavItem(item))}
            </List>

            {/* Divider after section if specified */}
            {section.showDividerAfter && (
              <Divider sx={{ mx: 2, my: 1, borderColor: BORDER_COLOR }} />
            )}
          </Box>
        ))}
      </Box>

      {/* Language Selector */}
      {showLanguageSelector && (
        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            size="small"
            sx={{
              fontSize: '13px',
              color: TEXT_COLOR,
              '& .MuiSelect-select': {
                py: 0.75,
                px: 1.5,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          >
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Español">Español</MenuItem>
            <MenuItem value="Français">Français</MenuItem>
          </Select>
        </Box>
      )}
    </Drawer>
  );
}
