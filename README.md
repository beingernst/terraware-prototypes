# Terraware Prototypes

Rapid prototyping environment for Terraware product development. Build interactive prototypes that match production visuals using the same design system.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Opens http://localhost:5173 with hot reload enabled.

## Project Structure

```
terraware-prototypes/
├── docs/                       # Documentation
│   ├── GETTING_STARTED.md      # PM guide for using with Claude Code
│   ├── COMPONENT_GUIDE.md      # Component catalog and usage
│   ├── DESIGN_TOKENS_REFERENCE.md
│   ├── PRODUCTION_PATTERNS.md
│   └── ENGINEERING_HANDOFF.md
│
├── src/
│   ├── design-system/          # Theme and design tokens
│   ├── components/             # Reusable component library
│   │   ├── core/               # Button, Card, Link, TextField, etc.
│   │   ├── layout/             # Page, PageHeader
│   │   └── data-display/       # Table, Badge
│   ├── shared/                 # Hooks, mock data, types
│   └── prototypes/             # Individual prototypes
│       ├── _template/          # Starter template
│       └── example-dashboard/  # Example prototype
│
└── vercel.json                 # Deployment config
```

## Creating a New Prototype

1. Copy the template:
   ```bash
   cp -r src/prototypes/_template src/prototypes/my-prototype
   ```

2. Add route in `src/App.tsx`:
   ```tsx
   import MyPrototype from './prototypes/my-prototype';
   // ...
   <Route path="/prototypes/my-prototype/*" element={<MyPrototype />} />
   ```

3. Start building!

Or just tell Claude Code:
> "Create a new prototype called 'feature-name' for testing [description]"

## Available Components

**From @terraware/web-components:**
- Button, Textfield, Select, DatePicker
- Table, Badge, BusySpinner
- DialogBox, Message, Tooltip
- And more...

**Custom components:**
- `Card` - Content container with title and loading state
- `Link` - Navigation and action links
- `Page` - Page layout wrapper

**Hooks:**
- `useMockData` - Simulate async data loading
- `useDeviceInfo` - Responsive breakpoint detection

See [docs/COMPONENT_GUIDE.md](docs/COMPONENT_GUIDE.md) for full details.

## Design System

Uses `@terraware/web-components` v4.0.2 with extended theme tokens.

Key colors:
- `theme.palette.TwClrBg` - White background
- `theme.palette.TwClrBgSecondary` - Gray page background
- `theme.palette.TwClrTxt` - Primary text
- `theme.palette.TwClrBrdrTertiary` - Borders

See [docs/DESIGN_TOKENS_REFERENCE.md](docs/DESIGN_TOKENS_REFERENCE.md) for full reference.

## Deployment

Deploy to Vercel for team reviews:

```bash
npm run build    # Build for production
npm run preview  # Preview locally
npm run deploy   # Deploy to Vercel (requires Vercel CLI)
```

## Documentation

- [Getting Started](docs/GETTING_STARTED.md) - Full PM guide
- [Component Guide](docs/COMPONENT_GUIDE.md) - All available components
- [Production Patterns](docs/PRODUCTION_PATTERNS.md) - Common UI patterns
- [Design Tokens](docs/DESIGN_TOKENS_REFERENCE.md) - Colors, spacing, typography
- [Engineering Handoff](docs/ENGINEERING_HANDOFF.md) - Template for validated prototypes

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Material-UI v6
- @terraware/web-components v4.0.2
- React Router v7

## Safety & Isolation

This system is completely isolated from production:
- Separate repository - no connection to terraware-web
- Uses published npm package (read-only)
- No production database or API access
- Manual code lift for implementation
