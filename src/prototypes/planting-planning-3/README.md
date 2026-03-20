# Planting Planning Prototype V3

## Overview

This prototype explores a workflow for setting up planting seasons and planning species distribution across zones with planting density tracking.

## Purpose

Test and validate:
- Visual Gantt chart interface for defining planting seasons
- Zone-level species planning with quantity targets
- Planting density calculations and progress tracking
- Multi-screen workflow with state preservation

## User Flow

### 1. Empty State (Plan Screen)
- User lands on "Plan" screen
- Sees empty state with map pin illustration
- Message: "You have not set up any Planting Seasons"
- CTA: "Set Up a Plan" button

### 2. Create Planting Seasons (Gantt Chart)
- After clicking "Set Up a Plan", user sees Gantt chart
- Single site: "Montanha do Sul" with 4 zones
- 12-month timeline (Jan-Dec)
- Click "+ Add Planting Season" button to open modal
- Define season name, start/end months, and select zones
- Months are pre-highlighted on Gantt for selected zones
- Click individual month cells to toggle selection

### 3. Plan A Season (Season Detail)
- Click on zone row or season name to drill into detail
- See all zones included in the season
- For each zone:
  - Enter target planting density (plants/ha)
  - Add species with quantities
  - View calculated current density
  - See progress percentage toward target
  - Color-coded status indicators
- Save/Discard buttons appear when changes are made

### 4. Progress Screen (Prerequisite Check)
- Click "Progress" in left nav
- If no plan exists: empty state prompts to create plan first
- "Go to Plan" button navigates back to Plan screen

## Key Features

### Gantt Chart
- Visual month selection interface
- Single site automatically expanded to show zones
- Rounded bars for contiguous month selections
- Click zone row to navigate to detail view

### Planting Density Calculator
- Input: Target density (plants per hectare)
- Calculated: Current density based on assigned species quantities
- Progress indicator: Percentage toward target
- Color coding:
  - Red: < 70% (significantly below target)
  - Yellow: 70-90% (below target)
  - Green: 90-110% (on target)
  - Orange: > 110% (above target)

### Species Management
- Add species to zones with quantities
- Update quantities inline
- Remove species assignments
- See available unassigned species
- Scientific and common names displayed

### Navigation
- Custom left nav with collapsed Seeds/Seedlings sections
- "Plan" and "Progress" menu items under Plants Dashboard
- Breadcrumb navigation in detail views

## Data Model

### PlantingSeason
- id, name, startMonth, endMonth, year
- zoneIds: array of zones included in season

### SpeciesAssignment
- zoneId, seasonId, speciesId, quantity

### DensityTarget
- zoneId, targetDensity (plants/ha)

### PlantingSite
- id, name, location
- zones: array of Zone objects

### Zone
- id, name, area (hectares)

## Technical Details

### State Management
- Local React state (useState)
- PlantingSchedule: nested object tracking month selections per zone per year
- Assignments: record of species assignments per zone
- DensityTargets: record of target densities per zone
- Change tracking for Save/Discard functionality

### Routing
- `/plan` - Main planning screen (empty state or Gantt)
- `/progress` - Progress tracking (empty state only in this version)
- `/plan/:seasonId` - Season detail for species planning

### Components
- PlanScreen.tsx - Empty state + Gantt chart + Add Season modal
- ProgressScreen.tsx - Progress empty state
- PlanSeasonDetail.tsx - Zone cards with species planning and density calculator
- mockData.ts - Types and mock data

## Testing Scenarios

### Scenario 1: First Time Setup
1. Open http://localhost:5173/prototypes/planting-planning-3
2. Verify empty state appears with map pin illustration
3. Click "Set Up a Plan"
4. Verify Gantt chart appears with Montanha do Sul site

### Scenario 2: Create Planting Season
1. Click "+ Add Planting Season"
2. Enter season name: "Spring Planting 2025"
3. Select start month: March, end month: May
4. Check zones: Zone A, Zone B
5. Click "Add Season"
6. Verify months March-May are highlighted for Zones A and B
7. Verify season appears in season list below

### Scenario 3: Plan Species Distribution
1. Click on Zone A row in Gantt
2. Enter target density: 500 plants/ha
3. Click "+ Add Species"
4. Select "Acacia (Acacia mangium)", quantity: 200
5. Click "Add"
6. Verify species appears in table
7. Verify current density updates
8. Verify progress percentage and color indicator
9. Add more species until reaching target
10. Click "Save Changes"

### Scenario 4: Progress Prerequisite Check
1. Click "Progress" in left nav
2. Verify empty state with "No Plan Created Yet" message
3. Click "Go to Plan"
4. Verify navigation back to Plan screen

## Design Decisions

### Single Site Focus
- Simplified to one site (Montanha do Sul) to focus on season planning workflow
- Site selector is read-only dropdown (can be enhanced to support multiple sites)

### Zone-Level Density Targets
- Default: per-zone targets for maximum flexibility
- Could be enhanced with site-level "apply to all zones" toggle

### Empty Gantt Chart
- Starts with no prepopulated data
- User explicitly creates seasons and selects months
- Ensures intentional planning decisions

### Progress Screen Stub
- Current version: empty state only
- Future: actual progress tracking against plan
- Demonstrates prerequisite dependency (must create plan first)

## Next Steps (Potential Enhancements)

1. **Multi-Site Support** - Add site selector and allow switching between sites
2. **Season Editing** - Allow editing season details after creation
3. **Season Deletion** - Add ability to remove seasons
4. **Site-Level Density Target** - Toggle to apply same target to all zones
5. **Progress Tracking** - Implement actual planting progress monitoring
6. **Species Filtering** - Search/filter species by name or characteristics
7. **Density Recommendations** - Suggest optimal densities based on zone characteristics
8. **Export/Print** - Generate PDF summary of planting plan
9. **Year Management** - Add/remove years, multi-year planning
10. **Validation** - Warn if seasons overlap, if density targets are unrealistic, etc.

## Files

- `index.tsx` - Router and custom navigation configuration
- `PlanScreen.tsx` - Main planning screen with Gantt chart (665 lines)
- `ProgressScreen.tsx` - Progress screen with empty state (60 lines)
- `PlanSeasonDetail.tsx` - Season detail with species planning (490 lines)
- `mockData.ts` - Data structures and helper functions (160 lines)
- `README.md` - This file

## URL

http://localhost:5173/prototypes/planting-planning-3

## Status

✅ Complete - Ready for user testing
