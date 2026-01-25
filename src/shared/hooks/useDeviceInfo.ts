import { useMediaQuery, useTheme } from '@mui/material';

/**
 * Hook for responsive breakpoint detection
 * Matches pattern from @terraware/web-components/utils
 */
export function useDeviceInfo() {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
}
