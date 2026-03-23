# Terraware Prototypes

Standalone rapid prototyping environment for Terraware product development. Uses the published `@terraware/web-components` npm package — completely isolated from production.

## Run

```bash
npm install && npm run dev
```

Opens http://localhost:5173 with hot reload.

## Create a New Prototype

1. Copy the template: `cp -r src/prototypes/_template src/prototypes/my-prototype`
2. Add route in `src/App.tsx`:
   ```tsx
   import MyPrototype from './prototypes/my-prototype';
   // inside <Routes>:
   <Route path="/prototypes/my-prototype/*" element={<MyPrototype />} />
   ```
3. Each prototype must have a **default export** from its `index.tsx`
4. Wrap content in `AppShell` with custom `NavSection[]` for sidebar navigation

## Conventions

- **Default export** from each prototype's `index.tsx`
- **`import type`** for TypeScript types — Vite strips type-only exports; bare imports cause runtime errors
- **MUI v6**: use `slotProps`, not deprecated `InputProps`/`componentsProps`
- **Path alias**: `@/` maps to `./src/`
- **Do NOT** modify `@terraware/web-components` or any production code

## Key Colors (from navigation components)

```typescript
const HEADER_BG = 'rgb(249, 248, 247)';
const TEXT_PRIMARY = '#3A4445';
const TEXT_SECONDARY = '#6B7165';
const BORDER_COLOR = '#E8E5E0';
const PRIMARY_GREEN = '#46CB89';
const ACTIVE_NAV_BG = '#DEE5D9';
```

Design tokens are in `src/design-system/tokens.ts`. Full reference: `docs/DESIGN_TOKENS_REFERENCE.md`.

## Existing Prototypes

| Prototype | Path | Description |
|-----------|------|-------------|
| Example Dashboard | `/prototypes/example-dashboard` | Production-matching dashboard with plants, species, and seeds cards |
| ME Test Prototype | `/prototypes/me-test-prototype` | Test prototype |
| Planting Planning Michael | `/prototypes/planting-planning-michael` | Nursery inventory planning and planting seasons |

## Tech Stack

React 19 + TypeScript, Vite, MUI v6, @terraware/web-components v4.0.2, React Router v7

## Documentation

- `docs/GETTING_STARTED.md` — PM guide for using with Claude Code
- `docs/COMPONENT_GUIDE.md` — All available components
- `docs/PRODUCTION_PATTERNS.md` — Common UI patterns
- `docs/DESIGN_TOKENS_REFERENCE.md` — Colors, spacing, typography
- `docs/ENGINEERING_HANDOFF.md` — Template for validated prototypes
- `CLAUDE_CONTEXT.md` — Detailed architectural decisions and session history
