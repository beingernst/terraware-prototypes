import type { ReactNode, CSSProperties } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';

export interface CardProps {
  busy?: boolean;
  children?: ReactNode;
  flushMobile?: boolean;
  rightComponent?: ReactNode;
  style?: CSSProperties;
  title?: string;
  radius?: string;
}

/**
 * Card component matching production terraware-web/src/components/common/Card.tsx
 *
 * @example
 * <Card title="Project Details">
 *   <Typography>Content here</Typography>
 * </Card>
 *
 * @example
 * <Card title="Loading Data" busy={isLoading}>
 *   <DataTable data={data} />
 * </Card>
 */
export function Card({
  busy,
  children,
  flushMobile,
  rightComponent,
  style,
  title,
  radius,
}: CardProps) {
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const flush = isMobile && flushMobile;

  return (
    <Box
      borderRadius={flush ? 0 : radius || theme.spacing(3)}
      padding={3}
      margin={flush ? theme.spacing(0, -3) : 0}
      sx={{
        ...(style || {}),
        backgroundColor: theme.palette.TwClrBg,
        position: 'relative',
      }}
    >
      {busy && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
            borderRadius: flush ? 0 : radius || theme.spacing(3),
          }}
        >
          <BusySpinner />
        </Box>
      )}
      {(title || rightComponent) && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            minHeight: '42px',
            justifyContent: 'space-between',
            marginBottom: theme.spacing(2),
          }}
        >
          <Typography
            color={theme.palette.TwClrTxt}
            fontSize="20px"
            fontWeight={600}
            lineHeight="28px"
          >
            {title || ''}
          </Typography>
          {rightComponent}
        </Box>
      )}
      {children}
    </Box>
  );
}
