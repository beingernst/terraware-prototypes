# Terraware Prototypes

Rapid prototyping environment for Terraware product development. Build interactive prototypes that match production visuals using the same design system.

## Getting Set Up

1. **Install [Claude Code](https://claude.ai/claude-code)** (if you don't have it already)
2. **Accept the GitHub repo invite** (check your email)
3. **Clone and go:**
   ```bash
   git clone https://github.com/nicolelwilke/terraware-prototypes.git
   cd terraware-prototypes
   claude
   ```
4. **Tell Claude:** *"I want to create prototypes for the team. Get me set up and running."*

Claude Code reads the project's `CLAUDE.md` automatically, so it knows all conventions. It will install Node if needed, run `npm install`, and start the dev server at http://localhost:5173.

From there, just describe what you want to build.

## Team Workflow

### Before you start working
Always pull latest first. Tell Claude Code *"pull latest before we start"* or run:
```bash
git pull
```

### Work on your own prototype
Copy `_template` into a new directory with a unique name. If you're working on `nursery-planning` and someone else is working on `inventory-redesign`, you're editing completely different files and won't conflict.

Or just tell Claude Code: *"Create a new prototype called 'my-feature-name'"*

### When you're at a stopping point
Tell Claude Code: *"commit and push my changes"*

### The one rule
**Don't edit someone else's prototype.** If you want to riff on one, copy it into a new directory. This prevents merge conflicts and keeps everyone unblocked.

### If something goes wrong
If `git pull` shows a merge conflict, tell Claude Code *"help me resolve this merge conflict"*. But with separate prototype directories, this should be rare.

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
