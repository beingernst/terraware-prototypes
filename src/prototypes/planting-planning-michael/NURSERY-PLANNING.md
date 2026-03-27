# Nursery Inventory Planning — Prototype Context

## What This Is

A cross-cutting view of nursery inventory vs planting demand across all sites. Users see targets per species, track nursery inventory, and redistribute allocations between planting sites. This lives under the **Seedlings > Planning** nav item in the `planting-planning` prototype.

**URL:** `/prototypes/planting-planning/nursery-planning`

## Files

| File | Purpose |
|------|---------|
| `nurseryPlanningData.ts` | Types, mock data, and helper functions |
| `NurseryPlanning.tsx` | Main page component (table, summary, interactions) |
| `index.tsx` | Routing and custom sidebar navigation |

### nurseryPlanningData.ts

**Types:** `Species`, `Nursery`, `PlantingSite`, `PlantingSeason`, `SiteAllocation`, `NurserySpeciesInventory`

**Mock data:**
- 10 Hawaiian native species (A'ali'i, 'Aweoweo, Pili, Wiliwili, Naio, 'Ilima, Ma'o, Koa, 'Ohi'a Lehua, Mamane)
- 3 nurseries (Waimea, Kona, Hilo)
- 5 planting sites (Pu'u Wa'awa'a, Mauna Meadows, Ocean View Lands, Lapakahi, Kahua Ranch)
- 2 planting seasons (Feb-Apr 2026, Oct-Dec 2026)
- Allocation scenarios: fulfilled, partial, gap, over-allocated, and zero-allocation

**Helpers:** `getSpeciesById()`, `getAllocationsForSpecies()`, `getNurseryInventoryForSpecies()`, `getTotalInventoryForSpecies()`, `getNurseryNamesForSpecies()`, `hasInventoryGap()`

### NurseryPlanning.tsx

**Layout (top to bottom):**
1. Title: "Nursery Inventory Planning"
2. Season selector dropdown + planting dates count
3. Summary bar: progress bar + Allocated / In Nurseries / Remaining / Target + "Allocate Plants" button
4. Species table with expandable rows

**Table columns:** (expand arrow) | Species | Common Name | Nurseries | Allocated | Total in Nursery | Remaining | Target | Request Fulfilled

**Key interactions:**
- Click a species row to expand and see per-site allocation sub-rows
- Sub-rows have an editable `TextField` in the **Allocated** column
- Focusing an input reveals the species-level **Total in Nursery** and **Remaining** values in light gray in that sub-row, so users can see how much inventory is left to distribute
- Remaining updates in real-time as users type, including showing negative values (red) for attempted over-allocations
- Over-allocation shows: red input border, error message spanning across columns, grey progress bar with no percentage
- All species-row totals and the top summary bar update in real-time

**Semantic progress bar colors:**
- Green (`#4CAF50`): fulfilled (allocated >= target)
- Amber (`#FF9800`): partial (some allocated, not yet at target)
- Red (`#F44336`): gap (zero allocated against a target)
- Grey (`#D5D5D5`): error/over-allocated state

**State:**
- `selectedSeasonId` — which planting season to view (dropdown)
- `allocations` — mutable copy of `SiteAllocation[]`, updated via text field edits
- `expandedSpecies` — `Set<string>` tracking which species rows are expanded

**Component structure:**
- `NurseryPlanning` — main page, owns state
- `SpeciesRow` — parent row + renders sub-rows directly (no nested table, so columns align)
- `SiteAllocationRow` — editable sub-row with focus-reveal behavior and error handling

### index.tsx

Custom sidebar nav matching the Terraware app structure:
- Home, Species
- Seeds, **Seedlings** (Inventory / **Planning** / Withdrawal Log), Plants
- Reports, Settings

Only Home (PlanningHome) and Planning (NurseryPlanning) have actual route handlers. Other nav items are placeholders.

## Design Conventions

- Uses the same color constants as `PlanningHome.tsx` (`HEADER_BG`, `TEXT_PRIMARY`, `TEXT_SECONDARY`, `BORDER_COLOR`, `PRIMARY_GREEN`)
- MUI v6 components throughout (Table, TextField, Select, LinearProgress, etc.)
- `slotProps` API for MUI component customization (not the deprecated `InputProps`)
- Types must be imported with `import type` to avoid Vite module errors

## What's Working

- [x] Season selector (switches between seasons, though both share the same allocation data for now)
- [x] Summary bar with real-time totals and progress
- [x] Species table with expand/collapse
- [x] Editable per-site allocations with real-time updates to species totals and summary
- [x] Over-allocation validation with inline error message
- [x] Focus-reveal of inventory context (Total in Nursery + Remaining) in sub-rows
- [x] Semantic progress bar colors (green/amber/red/grey)
- [x] Remaining column turns red with negative value on over-allocation

## Ideas for Next Iteration

- **Season-specific allocations** — currently both seasons share the same data; wire up separate allocation sets per season
- **"Allocate Plants" button** — currently a no-op; could open a modal for bulk/auto allocation
- **Sorting/filtering** — sort table by any column, filter by fulfillment status
- **Nursery breakdown** — show which nursery each allocation draws from (currently shows nursery names but not per-nursery quantities in the table)
- **Save/discard** — add persistence controls like PlanningHome has
- **Undo** — let users revert individual allocation changes
- **Drag to redistribute** — drag remaining inventory between sites
- **Mobile/responsive** — table is wide; consider a card layout for small screens
- **Connect to other prototype views** — link species rows to the species schedule view in PlanningHome
- **Wire the other sidebar nav items** — Inventory, Withdrawal Log, etc. are placeholder routes
