/**
 * Design tokens extracted from @terraware/web-components v4.0.2
 * and Zeroheight design system: https://zeroheight.com/55ab6cc27/p/5447b0-terraware-capture
 *
 * Last synced: January 2025
 */

export const TwColors = {
  // Background colors
  TwClrBg: '#FFFFFF',
  TwClrBgSecondary: '#F8F9FA',
  TwClrBgTertiary: '#E9ECEF',
  TwClrBgBrand: '#0067C8',

  // Text colors
  TwClrTxt: '#3A4445',
  TwClrTxtSecondary: '#6C757D',
  TwClrTxtBrand: '#0067C8',
  TwClrTxtWarning: '#856404',

  // Icon colors
  TwClrIcn: '#6C757D',
  TwClrIcnBrand: '#0067C8',

  // Border colors
  TwClrBrdrTertiary: '#DEE2E6',

  // Base colors - Gray scale (7-step)
  TwClrBaseGray025: '#F8F9FA',
  TwClrBaseGray050: '#E9ECEF',
  TwClrBaseGray100: '#DEE2E6',
  TwClrBaseGray200: '#CED4DA',
  TwClrBaseGray300: '#ADB5BD',
  TwClrBaseGray400: '#6C757D',
  TwClrBaseGray500: '#495057',
  TwClrBaseGray600: '#343A40',
  TwClrBaseGray800: '#1B1F20',

  // Base colors - Named
  TwClrBaseWhite: '#FFFFFF',
  TwClrBaseBlack: '#000000',
  TwClrBaseGreen050: '#E8F5E9',

  // Ghost state colors
  TwClrBgGhostActive: 'rgba(0, 103, 200, 0.08)',

  // Primary/Secondary (MUI default overrides)
  TwClrPrimary: '#0067C8',
  TwClrSecondary: '#D40002',
} as const;

export const TwSpacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px (1 spacing unit)
  md: 16,   // 16px (2 spacing units)
  lg: 24,   // 24px (3 spacing units)
  xl: 32,   // 32px (4 spacing units)
  xxl: 48,  // 48px (6 spacing units)
} as const;

export const TwTypography = {
  fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
