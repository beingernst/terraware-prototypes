# Component Guide

Quick reference for all available components in the prototype system.

## Import Patterns

```typescript
// Core components
import { Card, Link } from '@/components/core';

// Layout components
import { Page } from '@/components/layout';

// Web components (from production package)
import { Button, Textfield } from '@terraware/web-components';

// Hooks
import { useMockData, useDeviceInfo } from '@/shared/hooks';
```

## Core Components

### Card

Content container with optional title and loading state.

**Props:**
- `title?: string` - Card header title
- `busy?: boolean` - Show loading spinner overlay
- `flushMobile?: boolean` - Remove padding on mobile
- `rightComponent?: ReactNode` - Component in header (e.g., button)
- `children: ReactNode` - Card content

**Usage:**
```tsx
<Card title="Project Details" busy={isLoading}>
  <Typography>Content here</Typography>
</Card>
```

**Production:** `terraware-web/src/components/common/Card.tsx`

---

### Link

Navigation and action links matching production styling.

**Props:**
- `to?: string` - Router path for navigation
- `onClick?: () => void` - Click handler for button-style links
- `children: ReactNode` - Link text
- `disabled?: boolean` - Disable interaction
- `fontSize?: string | number` - Font size (default: '14px')
- `fontWeight?: number` - Font weight (default: 500)

**Usage:**
```tsx
// Router link
<Link to="/prototypes/dashboard">View Dashboard</Link>

// Button link
<Link onClick={handleAction}>Perform Action</Link>
```

**Production:** `terraware-web/src/components/common/Link.tsx`

---

### Button

Standard button from production design system.

**Usage:**
```tsx
import { Button } from '@terraware/web-components';

<Button label="Save Changes" onClick={handleSave} />
```

**Production:** `@terraware/web-components`

---

### TextField

Text input field from production design system.

**Usage:**
```tsx
import { Textfield } from '@terraware/web-components';

<Textfield
  label="Project Name"
  value={name}
  onChange={(value) => setName(value)}
  placeholder="Enter project name"
/>
```

**Production:** `@terraware/web-components`

---

## Layout Components

### Page

Page layout wrapper providing consistent structure.

**Props:**
- `title?: string` - Page title (h1)
- `children: ReactNode` - Page content
- `maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false` - Container width (default: 'lg')
- `padding?: number` - Content padding in spacing units (default: 3)

**Usage:**
```tsx
<Page title="Species Management" maxWidth="lg">
  <Card title="Species List">
    {/* content */}
  </Card>
</Page>
```

---

## Hooks

### useMockData

Simulates async data loading for prototypes.

**Usage:**
```tsx
import { useMockData } from '@/shared/hooks/useMockData';

const mockProjects = [
  { id: 1, name: 'Project A' },
  { id: 2, name: 'Project B' },
];

function MyComponent() {
  const { data, loading, error } = useMockData(mockProjects, 800);

  if (loading) return <BusySpinner />;

  return (
    <div>
      {data.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

---

### useDeviceInfo

Detects responsive breakpoints.

**Usage:**
```tsx
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useDeviceInfo();

  return (
    <Box padding={isMobile ? 2 : 3}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </Box>
  );
}
```

---

## Web Components Available

These are available from `@terraware/web-components`:

- `Button` - Primary action button
- `Textfield` - Text input
- `Select` - Dropdown select
- `DatePicker` - Date selection
- `Checkbox` - Checkbox input
- `RadioButton` - Radio selection
- `Table` - Data table
- `Badge` - Status badge
- `BusySpinner` - Loading spinner
- `DialogBox` - Modal dialog
- `Dropdown` - Dropdown menu
- `Icon` - Icon component
- `Message` - Alert/message display
- `Tabs` - Tab navigation
- `Tooltip` - Tooltip overlay

See the package documentation for full API details.

---

## Adding More Components

See existing components in `src/components/` for patterns.

When to add a new component:
- Used in 3+ prototypes
- Wraps MUI with consistent production styling
- Will be reused frequently

Keep prototype-specific components in the prototype directory.
