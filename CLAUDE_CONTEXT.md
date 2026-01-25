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

### 2. Planting Planning (`/prototypes/planting-planning`)
Interactive Gantt-chart style planting season planner with three views:

**View Navigation:**
- "Planting Plan: [View]" dropdown in header
- Three views: Overview (placeholder), Schedule (implemented), Species (initial implementation - needs UX work)

**Schedule View Features:**
- Dynamic year management - add/remove years via +/- buttons
- Year tabs positioned directly above table (removes youngest year with confirmation if has data)
- Month headers show year (e.g., "Jan '25", "Feb '25")
- **Sites with 0-1 zones**: directly editable without expanding (no expand arrow)
- **Sites with 2+ zones**: expandable to show individual zone scheduling
- Click-to-select month cells for planting periods
- Site rows show aggregate (combined zones) in darker green (#4A7C59)
- Zone rows show individual schedules in lighter green (#7DA88A)
- **Wet season indicators** - subtle blue cell background shading
  - Site rows: rgba(181, 212, 232, 0.15)
  - Zone rows: rgba(181, 212, 232, 0.08) - more desaturated
  - Wet seasons are per-site (stored in `site.wetSeasonMonths`)
- Darker borders between sites (#C8C5C0) for clear visual separation
- No bottom border on last zone row or collapsed site rows
- Click zone name to open map modal showing zone locations
- Sticky header with Save/Discard buttons
- "Unsaved changes" indicator
- Legend above the Gantt chart (site aggregate, zone planting, wet season)
- Summary section with condensed date ranges ("March through May")

**Key Components:**
- `PlanningHome.tsx` - Main component with all functionality
- Gantt chart grid with CSS Grid layout
- MUI Modal for zone map visualization
- MUI Menu for view selection dropdown
- State tracking for unsaved changes
- Confirmation modal for year deletion

**Colors:**
```typescript
const SITE_BAR_BG = '#4A7C59';           // Darker green for site aggregate
const ZONE_BAR_BG = '#7DA88A';           // Lighter green for zone bars
const SITE_BORDER_COLOR = '#C8C5C0';     // Darker border between sites
const WET_SEASON_BG = 'rgba(181, 212, 232, 0.15)';      // Site wet season
const WET_SEASON_ZONE_BG = 'rgba(181, 212, 232, 0.08)'; // Zone wet season
```

**Data Structure - PlantingSite:**
```typescript
interface PlantingSite {
  id: number;
  name: string;
  location: string;
  area: string;
  zones: Zone[];              // Can be empty array (0 zones)
  wetSeasonMonths: Set<number>; // 0-11, set on another page
}

// Sites with 0 zones use 'site-{id}' as schedule key
// Sites with 1 zone use zone.id directly (editable without expanding)
// Sites with 2+ zones must be expanded to edit individual zones
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

**Species View (Initial Implementation - Needs UX Refinement):**
- Expandable site list showing zones for species assignment
- Sites with zones: expand to see individual zone species tables
- Sites without zones (Northern Reserve): show species table directly
- Each zone has a SpeciesTable component with:
  - Table of assigned species (common name, scientific name, quantity)
  - Editable quantity input fields
  - Delete button to remove species
  - "Add Species" button with dropdown of unassigned species
- Site-level aggregates: total species count and total plants
- Grand total summary at bottom (unique species across all sites, total plants)
- Mock data: 10 available species (Teak, Mahogany, Jackfruit, etc.)
- **Known issue**: UX needs work - the current interface is functional but not intuitive

**Species Data Structures:**
```typescript
interface Species {
  id: string;
  commonName: string;
  scientificName: string;
}

interface SpeciesAssignment {
  speciesId: string;
  quantity: number;
}

// Species assignments per zone: zoneId -> assignments[]
type SpeciesSchedule = Record<string, SpeciesAssignment[]>;
```

---

## Future Exploration (Next Session)

For the Planting Planning prototype:

1. **Species View UX Improvements** - The current species planning interface needs better UX design
2. **Wet Season Editing Page** - Create a separate page/modal to edit wet season months per site
3. **Planting Density Calculator** - Calculate how many plants needed to achieve target density
4. **Multi-Year Seasons** - Planning seasons that span across year boundaries
5. **Repeating Seasons** - Copy/repeat seasons across multiple years
6. **Connect Species to Schedule** - Link species quantities to specific planting periods

---

## Session History

### Session 6 (Current) - Species Planning View
- **Species View initial implementation**:
  - Added Species interface, SpeciesAssignment interface, SpeciesSchedule type
  - Created mock availableSpecies list (10 tropical species)
  - Created createInitialSpeciesSchedule() with sample assignments
  - Built SpeciesTable component for zone-level species management
  - Expandable site list showing zones (similar pattern to Schedule view)
  - Each zone has its own species table with add/edit/remove capabilities
  - Site-level and grand total summaries
- **Species management functions**:
  - addSpeciesToZone, updateSpeciesQuantity, removeSpeciesFromZone
  - getZoneSpecies, getZoneTotalPlants, getSiteTotalPlants
  - getSiteSpeciesAggregate, getUnassignedSpecies
- **Known UX issues to address next session**:
  - Interface is functional but not intuitive
  - Need to improve the overall user experience

### Session 5 - Enhanced Wet Seasons & View Navigation
- **Wet season visual refinement**:
  - Changed from water drop icons to subtle blue cell background shading
  - Site rows: rgba(181, 212, 232, 0.15) - subtle blue tint
  - Zone rows: rgba(181, 212, 232, 0.08) - more desaturated
  - Applied to both site and zone rows for consistency
- **Improved site border hierarchy**:
  - Darker borders between sites (#C8C5C0) instead of thicker borders
  - Removed bottom border on last zone row in each site
  - Removed bottom border on collapsed site rows
  - Creates clearer visual separation between different sites
- **Sites with 0-1 zones made directly editable**:
  - No expand/collapse arrow shown
  - Month cells are directly clickable to toggle planting periods
  - Site row acts like a zone row (hover effects, cursor pointer)
  - Northern Reserve changed to have 0 zones for demo
- **Schedule tracking for sites without zones**:
  - Uses `site-{id}` as key for sites with 0 zones
  - Sites with 1 zone use zone.id (acts as if site-level)
  - Summary view handles both patterns correctly
- **Dynamic year management**:
  - Year tabs moved directly above table (below legend)
  - Add year (+) button adds next sequential year
  - Remove year (-) button removes youngest/most recent year
  - Confirmation modal shown when deleting year with existing data
  - Years are now dynamic state (not hardcoded 2025-2028)
- **View navigation system**:
  - Added "Planting Plan: [View]" dropdown in sticky header
  - Three views: Overview (first), Schedule, Species
  - Schedule view is current implementation
  - Overview and Species are placeholder cards for future development
- **Layout fixes**:
  - Fixed side-scrolling issue (added minWidth: 0 to AppShell)
  - Page uses full width (maxWidth={false}) for Gantt chart

### Session 4 - Wet Season Indicators
- Initialized git repository and created initial commit
- Added wet season indicators to Planting Planning prototype:
  - Month headers now show year (e.g., "Jan '25")
  - Wet seasons are per-site (different sites can have different wet seasons)
  - Small water drop icons appear at bottom of site row cells for wet months
  - Subtle styling: 10px icon, light blue (#B5D4E8), 80% opacity
  - Legend moved above the Gantt chart
  - Wet season editing will happen on a separate page (not this table)
- Explored and removed editable wet season row (decided editing belongs elsewhere)

### Session 3 - Planting Planning Prototype
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

*Last updated: Session 6 - Species Planning view initial implementation (needs UX refinement)*
