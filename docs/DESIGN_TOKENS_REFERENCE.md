# Design Tokens Reference

Extracted from Zeroheight design system and @terraware/web-components package.

**Source:** https://zeroheight.com/55ab6cc27/p/5447b0-terraware-capture
**Last Updated:** January 2025

## Colors

### Background Colors
- `TwClrBg: #FFFFFF` - Main background
- `TwClrBgSecondary: #F8F9FA` - Secondary background (page)
- `TwClrBgTertiary: #E9ECEF` - Tertiary background
- `TwClrBgBrand: #0067C8` - Brand background

### Text Colors
- `TwClrTxt: #3A4445` - Primary text
- `TwClrTxtSecondary: #6C757D` - Secondary text
- `TwClrTxtBrand: #0067C8` - Brand text (links, emphasis)
- `TwClrTxtWarning: #856404` - Warning text

### Border Colors
- `TwClrBrdrTertiary: #DEE2E6` - Standard borders

### Gray Scale
- `TwClrBaseGray025: #F8F9FA` - Lightest gray
- `TwClrBaseGray050: #E9ECEF`
- `TwClrBaseGray100: #DEE2E6`
- `TwClrBaseGray200: #CED4DA`
- `TwClrBaseGray300: #ADB5BD`
- `TwClrBaseGray400: #6C757D`
- `TwClrBaseGray500: #495057`
- `TwClrBaseGray600: #343A40`
- `TwClrBaseGray800: #1B1F20` - Darkest gray

## Spacing

Based on 8px spacing unit:

- `theme.spacing(1)` = 8px
- `theme.spacing(2)` = 16px
- `theme.spacing(3)` = 24px (common card padding)
- `theme.spacing(4)` = 32px
- `theme.spacing(6)` = 48px

## Typography

### Font Family
Inter, Helvetica, Arial, sans-serif

### Font Sizes
- 12px - Small labels
- 14px - Body text, buttons
- 16px - Standard body
- 18px - Large body
- 20px - Card titles
- 24px - Section headings
- 30px - Page titles

### Font Weights
- 400 - Regular
- 500 - Medium (default for UI text)
- 600 - Semibold (card titles, emphasis)
- 700 - Bold (headers)

## Component Specifications

### Cards
- Background: `TwClrBg`
- Border radius: `theme.spacing(3)` (24px)
- Padding: `theme.spacing(3)` (24px)
- Title size: 20px
- Title weight: 600

### Buttons
- Height: 36px (medium), 42px (large)
- Font size: 14px
- Font weight: 500
- Border radius: 8px

### Forms
- Label size: 14px
- Input height: 40px
- Grid spacing: `theme.spacing(3)` (24px)

## Usage in Code

```tsx
import { useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        color: theme.palette.TwClrTxt,
        padding: theme.spacing(3),
        borderRadius: theme.spacing(3),
      }}
    >
      Content
    </Box>
  );
}
```

## Using Tokens Directly

```tsx
import { TwColors, TwSpacing, TwTypography } from '@/design-system/tokens';

// Colors
TwColors.TwClrPrimary // '#0067C8'
TwColors.TwClrTxt // '#3A4445'

// Spacing
TwSpacing.lg // 24
TwSpacing.md // 16

// Typography
TwTypography.fontWeight.semibold // 600
TwTypography.fontSize.xl // 20
```
