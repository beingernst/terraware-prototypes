# Design System

This directory contains the theme configuration and design tokens for the prototype system.

## Files

- `tokens.ts` - Design tokens extracted from @terraware/web-components and Zeroheight
- `theme.ts` - MUI theme configuration extending the production theme

## Usage

```typescript
import { prototypeTheme } from '@/design-system/theme';
import { TwColors, TwSpacing, TwTypography } from '@/design-system/tokens';

// Use theme in components
const theme = useTheme();
theme.palette.TwClrBg // '#FFFFFF'
theme.palette.TwClrTxt // '#3A4445'

// Use tokens directly
TwColors.TwClrPrimary // '#0067C8'
TwSpacing.lg // 24
TwTypography.fontWeight.semibold // 600
```

## Syncing with Production

To update tokens:
1. Check @terraware/web-components changelog for changes
2. Review Zeroheight documentation: https://zeroheight.com/55ab6cc27/p/5447b0-terraware-capture
3. Update tokens.ts with new values
4. Update theme.ts if palette extensions change
5. Update docs/DESIGN_TOKENS_REFERENCE.md
