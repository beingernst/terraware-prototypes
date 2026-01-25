import type { ReactNode, CSSProperties } from 'react';
import { Link as RouterLink } from 'react-router';
import { Link as MuiLink } from '@mui/material';

export interface LinkProps {
  to?: string;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  fontSize?: string | number;
  fontWeight?: number;
  style?: CSSProperties;
}

/**
 * Link component matching production terraware-web/src/components/common/Link.tsx
 * Supports both router navigation and button-style links
 *
 * @example
 * // Router link
 * <Link to="/prototypes/dashboard">View Dashboard</Link>
 *
 * @example
 * // Button link
 * <Link onClick={handleAction}>Perform Action</Link>
 */
export function Link({
  to,
  onClick,
  children,
  disabled,
  fontSize = '14px',
  fontWeight = 500,
  style = {},
}: LinkProps) {
  const baseStyle: CSSProperties = {
    fontSize,
    fontWeight,
    color: 'rgb(44, 134, 88)',
    textDecoration: 'none',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'default' : 'pointer',
  };

  if (to && !disabled) {
    return (
      <RouterLink
        to={to}
        style={{ ...baseStyle, ...style }}
      >
        {children}
      </RouterLink>
    );
  }

  return (
    <MuiLink
      component="button"
      onClick={disabled ? undefined : onClick}
      sx={{
        ...baseStyle,
        ...style,
        background: 'none',
        border: 'none',
        padding: 0,
        '&:hover': {
          textDecoration: 'none',
        },
      }}
    >
      {children}
    </MuiLink>
  );
}
