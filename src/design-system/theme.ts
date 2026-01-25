import { createTheme } from '@mui/material/styles';
import { theme as terrawareTheme } from '@terraware/web-components';
import { TwColors, TwTypography } from './tokens';

// Extend MUI theme to include custom TwClr tokens
declare module '@mui/material/styles' {
  interface Palette {
    TwClrBg: string;
    TwClrBgSecondary: string;
    TwClrBgTertiary: string;
    TwClrTxt: string;
    TwClrTxtSecondary: string;
    TwClrTxtBrand: string;
    TwClrBaseGray025: string;
    TwClrBaseGray050: string;
    TwClrBaseGray100: string;
    TwClrBaseGray800: string;
    TwClrBrdrTertiary: string;
  }
  interface PaletteOptions {
    TwClrBg?: string;
    TwClrBgSecondary?: string;
    TwClrBgTertiary?: string;
    TwClrTxt?: string;
    TwClrTxtSecondary?: string;
    TwClrTxtBrand?: string;
    TwClrBaseGray025?: string;
    TwClrBaseGray050?: string;
    TwClrBaseGray100?: string;
    TwClrBaseGray800?: string;
    TwClrBrdrTertiary?: string;
  }
}

export const prototypeTheme = createTheme({
  ...terrawareTheme,

  palette: {
    ...terrawareTheme.palette,
    // Extend with custom TwClr tokens for easy access
    TwClrBg: TwColors.TwClrBg,
    TwClrBgSecondary: TwColors.TwClrBgSecondary,
    TwClrBgTertiary: TwColors.TwClrBgTertiary,
    TwClrTxt: TwColors.TwClrTxt,
    TwClrTxtSecondary: TwColors.TwClrTxtSecondary,
    TwClrTxtBrand: TwColors.TwClrTxtBrand,
    TwClrBaseGray025: TwColors.TwClrBaseGray025,
    TwClrBaseGray050: TwColors.TwClrBaseGray050,
    TwClrBaseGray100: TwColors.TwClrBaseGray100,
    TwClrBaseGray800: TwColors.TwClrBaseGray800,
    TwClrBrdrTertiary: TwColors.TwClrBrdrTertiary,
  },

  typography: {
    fontFamily: TwTypography.fontFamily,
  },

  spacing: 8, // Base spacing unit (8px)

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1400,
    },
  },
});
