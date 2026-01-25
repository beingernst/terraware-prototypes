# Components

Component library for Terraware prototypes.

## Structure

```
components/
├── core/           # Essential form & UI components
│   ├── Button/     # Re-export from web-components
│   ├── Card/       # Custom wrapper matching production
│   ├── DatePicker/ # Re-export from web-components
│   ├── Link/       # Custom wrapper matching production
│   ├── Select/     # Re-export from web-components
│   └── TextField/  # Re-export from web-components
├── layout/         # Page structure components
│   └── Page/       # Page wrapper component
└── data-display/   # Data visualization components
    ├── Badge/      # Re-export from web-components
    └── Table/      # Re-export from web-components
```

## Usage

```typescript
// Import from core
import { Card, Link, Button } from '@/components/core';

// Import from layout
import { Page } from '@/components/layout';

// Import from data-display
import { Table, Badge } from '@/components/data-display';
```

## When to Add New Components

Add to this library if:
- Used in 3+ prototypes
- Wraps production component with consistent styling
- Will be reused frequently

Keep prototype-specific components in the prototype directory.
