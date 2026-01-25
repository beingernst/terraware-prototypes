# Terraware Prototypes - Development Context

> **Purpose**: This document captures architectural decisions, implementation details, and session context for continuity across Claude Code sessions. Read this before making changes.

---

## Project Overview

**What is this?**
A standalone rapid prototyping environment for Terraware product development. It allows PMs to work with Claude Code to create interactive prototypes that visually match the production terraware-web application.

**Key Principle**: "Reference, Don't Replicate"
We use the published `@terraware/web-components` npm package as the design system source of truth, rather than copying production code.

**Safety**: This repo is completely isolated from production. No connection to terraware-web, databases, or APIs.

**Branding**: This is the "vibes edition" - a prototyping environment styled after production but with its own identity.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 7.x | Build tool & dev server |
| MUI (Material-UI) | 6.x | Component library |
| @terraware/web-components | 4.0.2 | Production design system |
| React Router | 7.x | Client-side routing |
| date-fns | 3.x | Date utilities |
| Share Tech Mono | Google Font | "vibes edition" branding font |

---

## Project Structure

```
terraware-prototypes/
├── src/
│   ├── App.tsx                    # Root component with routing (each prototype has own AppShell)
│   ├── main.tsx                   # Vite entry point
│   ├── assets/                    # Static assets
│   │   └── tw-tf-logo-desktop.svg # Terraware logo
│   │
│   ├── design-system/             # Theme configuration
│   │   ├── theme.ts               # MUI theme extending @terraware/web-components
│   │   └── tokens.ts              # Design tokens (colors, spacing, typography)
│   │
│   ├── components/
│   │   ├── core/                  # Reusable UI components
│   │   │   ├── Card/              # Content container with loading state
│   │   │   ├── Link/              # Navigation links (green, no underline)
│   │   │   ├── Button/            # Re-export from web-components
│   │   │   ├── TextField/         # Re-export from web-components
│   │   │   ├── DatePicker/        # Re-export from web-components
│   │   │   └── Select/            # Re-export from web-components
│   │   │
│   │   ├── layout/
│   │   │   └── Page/              # Page wrapper (title, max-width, padding)
│   │   │
│   │   ├── navigation/            # App shell components
│   │   │   ├── TopNav.tsx         # Top navigation bar with logo + "vibes edition"
│   │   │   ├── Sidebar.tsx        # Configurable left sidebar navigation
│   │   │   └── AppShell.tsx       # Combines TopNav + Sidebar + content
│   │   │
│   │   └── data-display/
│   │       ├── Table/             # Re-export from web-components
│   │       └── Badge/             # Re-export from web-components
│   │
│   ├── shared/
│   │   ├── hooks/
│   │   │   ├── useDeviceInfo.ts   # Responsive breakpoint detection
│   │   │   └── useMockData.ts     # Simulates async data loading
│   │   ├── mock-data/             # Sample data for prototypes
│   │   └── types/                 # TypeScript type definitions
│   │
│   └── prototypes/
│       ├── _template/             # Starter template for new prototypes
│       ├── example-dashboard/     # Dashboard prototype matching production
│       ├── me-test-prototype/     # Test prototype (unused)
│       └── planting-planning/     # **NEW** Planting season planning prototype
│
├── docs/                          # Documentation for PMs
├── scripts/
│   └── fix-terraware-package.js   # Postinstall fix for web-components
└── vercel.json                    # Deployment configuration
```

---

## Architecture Decisions

### 1. AppShell Pattern (Per-Prototype)
Each prototype wraps itself in `AppShell` which provides:
- Fixed `TopNav` at top (~60px height with padding)
- Configurable `Sidebar` on left (200px width)
- Scrollable content area with gradient background
- Consistent padding (px: 3, py: 2 = 24px horizontal, 16px vertical)

```tsx
// Each prototype controls its own AppShell
export default function MyPrototype() {
  return (
    <AppShell sections={customNavSections}>
      <Routes>
        <Route index element={<MyHome />} />
      </Routes>
    </AppShell>
  );
}
```

### 2. Configurable Navigation
The Sidebar now supports custom navigation per prototype:

```tsx
// Types for navigation configuration
interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
  badge?: string; // Optional badge like "NEW"
}

interface NavSection {
  label?: string; // Section header (optional)
  items: NavItem[];
  showDividerAfter?: boolean;
}

// Usage
<AppShell sections={customSections} showLanguageSelector={false}>
```

**Default Sidebar Structure (matches production):**
- Home, Species (top section)
- **ACCELERATOR**: Application (NEW badge), Deliverables, Modules, Activity Log, Reports
- Seeds, Seedlings, Plants (all expandable)
- **SETTINGS**: Organization, People, Projects, Locations (expandable)
- Language selector at bottom

### 3. Navigation Components
Located in `src/components/navigation/`:

**TopNav.tsx**
- SVG logo from `src/assets/tw-tf-logo-desktop.svg`
- "vibes edition" text in Share Tech Mono font, green (#46CB89)
- Organization dropdown (default: "Treemendo.us")
- Help, Notifications, Settings icons
- User dropdown (default: "Clara")
- Background: `rgb(249, 248, 247)`

**Sidebar.tsx**
- Fully configurable via `sections` prop
- Active state with sage green background (#DEE5D9)
- Expandable sections with collapse animation
- Support for badges (e.g., "NEW")
- Dividers between sections
- Language selector at bottom

**Key Colors**:
```typescript
const ACTIVE_BG = '#DEE5D9';     // Cool sage green (active nav item)
const ICON_COLOR = '#6B7165';    // Muted greenish-gray
const TEXT_COLOR = '#3A4445';    // Main text
const BORDER_COLOR = '#E8E5E0';  // Dividers and borders
```

**Layout Dimensions:**
- `SIDEBAR_WIDTH = 200` (pixels)
- `TOP_NAV_HEIGHT = 60` (pixels)

### 4. Page Background Gradient
```typescript
backgroundColor: 'rgb(249, 248, 247)',
backgroundImage: 'linear-gradient(180deg, rgba(226, 246, 236, 0) 0%, rgba(226, 246, 236, 0.4) 100%)',
```

### 5. Button Styling
```tsx
<Button label="Button Text" onClick={handler} type="productive" priority="secondary" />
<Button label="Primary Action" onClick={handler} type="productive" priority="primary" />
```

---

## Active Prototypes

### 1. Example Dashboard (`/prototypes/example-dashboard`)
Production-matching dashboard with:
- Welcome header
- Plants card with map placeholder
- Species/Seeds/Seedlings summary cards
- Mobile app download banner
- Accelerator footer banner

### 2. Planting Planning (`/prototypes/planting-planning`) **NEW**
Interactive Gantt-chart style planting season planner:

**Features:**
- Year tabs (2025-2028) for multi-year planning
- Expandable site rows showing zones
- Click-to-select month cells for planting periods
- Site rows show aggregate (combined zones) in darker green
- Zone rows show individual schedules in lighter green
- Click zone name to open map modal showing zone locations
- Sticky header with Save/Discard buttons
- "Unsaved changes" indicator
- Summary section with condensed date ranges ("March through May")

**Key Components:**
- `PlanningHome.tsx` - Main component with all functionality
- Gantt chart grid with CSS Grid layout
- MUI Modal for zone map visualization
- State tracking for unsaved changes

**Colors:**
```typescript
const SITE_BAR_BG = '#4A7C59';   // Darker green for site aggregate
const ZONE_BAR_BG = '#7DA88A';   // Lighter green for zone bars
```

---

## Known Issues & Workarounds

### 1. @terraware/web-components Package Fix
The published package has an incorrect `main` field.
**Workaround**: `scripts/fix-terraware-package.js` runs on `postinstall`.

### 2. Missing Dependencies
The web-components package requires `hex-rgb` and `lodash`.
**Solution**: Added to our package.json dependencies.

### 3. SASS Deprecation Warnings
Warnings about `Global built-in functions are deprecated` come from @terraware/web-components. Safe to ignore.

### 4. Button onClick Required
```tsx
<Button label="Click me" onClick={() => {}} />
```

### 5. Chunk Size Warnings
Expected due to MapBox GL from web-components.

---

## Commands Quick Reference

```bash
npm run dev        # Start dev server (usually port 5173, 5174, or 5175)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npx tsc --noEmit   # Type check without building
```

---

## Future Exploration (Next Session)

For the Planting Planning prototype:

1. **Wet Seasons** - Add ability to indicate wet/dry seasons and how they affect planting windows
2. **Species Selection** - Specify which species (by quantity) need to be planted each season
3. **Planting Density Calculator** - Calculate how many plants needed to achieve target density
4. **Multi-Year Seasons** - Planning seasons that span across year boundaries
5. **Repeating Seasons** - Copy/repeat seasons across multiple years

---

## Session History

### Session 3 (Current) - Planting Planning Prototype
- Updated default Sidebar to match production navigation structure
- Added ACCELERATOR section, expandable items, badges, dividers, language selector
- Made Sidebar fully configurable via `sections` prop
- Changed architecture so each prototype manages its own AppShell
- **Created Planting Planning prototype** with:
  - Gantt-chart style interface for selecting planting months
  - Multi-year support (2025-2028 tabs)
  - Expandable site rows with zone-level scheduling
  - Aggregate view for sites (combined zones)
  - Zone map modal with visual zone layout
  - Sticky header with Save/Discard Changes buttons
  - Unsaved changes detection and indicator
  - Summary with condensed date ranges ("March through May")
  - Flipped colors: darker for sites, lighter for zones

### Session 2 - Dashboard Content & Styling
- Updated dashboard page content to match production screenshot
- Created Plants card, Species/Seeds/Seedlings summary cards
- Added mobile app banner and accelerator footer
- Implemented page gradient background
- Updated TopNav with SVG logo and "vibes edition" branding
- Fixed button and link styling

### Session 1 - Initial Setup & Navigation
- Project initialization with Vite + React + TypeScript
- Design system setup
- Core components created
- Navigation system implemented (TopNav, Sidebar, AppShell)

---

*Last updated: Session 3 - Planting Planning prototype with zone-level scheduling*
