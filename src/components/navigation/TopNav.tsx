/**
 * TopNav Component
 *
 * The top navigation bar matching the production Terraware app.
 * Includes logo, organization selector, and user menu.
 */

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  HelpOutline as HelpIcon,
  NotificationsNone as NotificationsIcon,
  SettingsOutlined as SettingsIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import logoSvg from '@/assets/tw-tf-logo-desktop.svg';

// Colors matching production
const TEXT_COLOR = '#3A4445';
const ICON_COLOR = '#6B7165';
const BORDER_COLOR = '#E5E5E0';

export interface TopNavProps {
  organizationName?: string;
  userName?: string;
}

export function TopNav({
  organizationName = 'Treemendo.us',
  userName = 'Clara',
}: TopNavProps) {
  // State for dropdown menus
  const [orgAnchorEl, setOrgAnchorEl] = useState<null | HTMLElement>(null);
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  const handleOrgClick = (event: React.MouseEvent<HTMLElement>) => {
    setOrgAnchorEl(event.currentTarget);
  };
  const handleOrgClose = () => {
    setOrgAnchorEl(null);
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };
  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: 'rgb(249, 248, 247)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: 'auto !important', py: '15px', px: 2 }}>
        {/* Left section: Logo + Organization */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Terraformation Logo + Vibes Edition */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <img src={logoSvg} alt="Terraware by Terraformation" height={30} />
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: BORDER_COLOR }}
            />
            <Typography
              sx={{
                fontFamily: '"Share Tech Mono", monospace',
                fontSize: '16px',
                color: '#46CB89',
              }}
            >
              vibes edition
            </Typography>
          </Box>

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5, borderColor: BORDER_COLOR }}
          />

          {/* Organization Dropdown */}
          <Box
            onClick={handleOrgClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { opacity: 0.7 },
            }}
          >
            <Typography
              sx={{
                color: TEXT_COLOR,
                fontSize: '16px',
                fontWeight: 400,
              }}
            >
              {organizationName}
            </Typography>
            <ArrowDownIcon sx={{ color: ICON_COLOR, fontSize: 18, ml: 0.25 }} />
          </Box>
          <Menu
            anchorEl={orgAnchorEl}
            open={Boolean(orgAnchorEl)}
            onClose={handleOrgClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            <MenuItem onClick={handleOrgClose}>{organizationName}</MenuItem>
            <Divider />
            <MenuItem onClick={handleOrgClose}>Switch Organization...</MenuItem>
          </Menu>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right section: Icons + User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Help Icon */}
          <IconButton
            size="small"
            sx={{
              color: ICON_COLOR,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <HelpIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Notifications Icon */}
          <IconButton
            size="small"
            sx={{
              color: ICON_COLOR,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <NotificationsIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Settings Icon */}
          <IconButton
            size="small"
            sx={{
              color: ICON_COLOR,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
            }}
          >
            <SettingsIcon sx={{ fontSize: 20 }} />
          </IconButton>

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, borderColor: BORDER_COLOR }}
          />

          {/* User Dropdown */}
          <Box
            onClick={handleUserClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:hover': { opacity: 0.7 },
            }}
          >
            <Typography
              sx={{
                color: TEXT_COLOR,
                fontSize: '16px',
                fontWeight: 400,
              }}
            >
              {userName}
            </Typography>
            <ArrowDownIcon sx={{ color: ICON_COLOR, fontSize: 18, ml: 0.25 }} />
          </Box>
          <Menu
            anchorEl={userAnchorEl}
            open={Boolean(userAnchorEl)}
            onClose={handleUserClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleUserClose}>Settings</MenuItem>
            <MenuItem onClick={handleUserClose}>Log out</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
