# Terraware Prototypes

Rapid prototyping environment for Terraware product development. Build interactive prototypes that match production visuals using the same design system.

## Prerequisites

- **Node.js 20+** (LTS) — if you use [nvm](https://github.com/nvm-sh/nvm), [fnm](https://github.com/Schniz/fnm), or [mise](https://mise.jdx.dev/), just run `nvm use` / `fnm use` / `mise install` and the `.node-version` file will be picked up automatically
- **npm 9+** (ships with Node 20)
- Optionally, [Claude Code](https://claude.ai/claude-code) — the repo includes a `CLAUDE.md` so Claude Code automatically understands project conventions

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

## Existing Prototypes

| Prototype | URL | Description |
|-----------|-----|-------------|
| Example Dashboard | `/prototypes/example-dashboard` | Production-matching dashboard with plants, species, and seeds cards |
| Planting Planning | `/prototypes/planting-planning` | Gantt-chart planting season planner with multi-year scheduling |
| Planting Planning 2 | `/prototypes/planting-planning-2` | Iteration on planting planning |
| Planting Planning 3 | `/prototypes/planting-planning-3` | Further iteration on planting planning |
| ME Test Prototype | `/prototypes/me-test-prototype` | Test prototype |

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
