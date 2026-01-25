# Getting Started with Terraware Prototypes

## For Product Managers Using Claude Code

This guide shows you how to use the terraware-prototypes system with Claude Code to rapidly build interactive prototypes.

## Quick Start

### 1. Run the Development Server

```bash
cd terraware-prototypes
npm run dev
```

Opens http://localhost:5173 with hot reload enabled.

### 2. Create a New Prototype

Tell Claude Code:

> "Create a new prototype called 'species-import' for testing a CSV upload workflow"

Claude Code will:
- Create `src/prototypes/species-import/` directory
- Set up routing in App.tsx
- Create initial component files
- Generate mock data structure

### 3. Build Your Prototype (Three Approaches)

**Approach A: Just Describe It (No Figma Needed)**

> "Add a page with a card containing a file upload dropzone and a Continue button"

Claude Code builds it using existing components.

**Approach B: Reference Production (No Figma Needed)**

> "Add a form like the one in species management - 2 columns with text fields for name and scientific name"

Claude Code uses production patterns.

**Approach C: Reference Figma (Optional, When You Have It)**

> "Build this based on my Figma design. The layout has:
> - Page title 'Import Species'
> - Main card with 3-column form layout
> - Text fields for: Common Name, Scientific Name, Family
> - Primary button 'Save' bottom right"

Claude Code builds from your description of the Figma.

### 4. Iterate Quickly

Make changes:

> "Add sorting to the preview table"
> "Change the button text from Save to Continue"
> "Make the form 2 columns instead of 3 on mobile"

Changes appear instantly in your browser with hot reload.

## Common Commands

### Starting Fresh
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
```

### Deployment
```bash
npm run build        # Build for production
npm run preview      # Preview production build
vercel --prod        # Deploy to Vercel (requires setup)
```

### Switching Prototypes
Navigate in browser to:
- http://localhost:5173/prototypes/example-dashboard
- http://localhost:5173/prototypes/species-import
- etc.

## Working with Claude Code

### Best Practices

**1. Be Specific About Layout**
- Good: "3-column grid on desktop, single column on mobile"
- Bad: "Make it look nice"

**2. Reference Production Features**
- Good: "Make the table look like the deliverables table in production"
- Claude Code understands production patterns

**3. Describe Figma Clearly**
- Mention spacing (tight, normal, spacious)
- Specify component types (card, dialog, form)
- Note responsive behavior

**4. Iterate in Small Steps**
- Add one feature at a time
- Test each change before moving on
- Build complexity gradually

### Example Conversation Flow

```
You: Create a new prototype for cohort onboarding flow

Claude Code: [Creates prototype structure and initial files]

You: Add a multi-step form with 3 steps: Details, Members, Review

Claude Code: [Builds 3-step form with navigation]

You: Make the Details step have fields for Name, Start Date, and Region

Claude Code: [Adds form fields using TextField and DatePicker components]

You: Add a table in the Members step for adding team members

Claude Code: [Creates table with add/remove functionality]

You: The table should match the styling of our production user tables

Claude Code: [Applies production table patterns]
```

## Next Steps

1. Read [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) to see available components
2. Review [PRODUCTION_PATTERNS.md](./PRODUCTION_PATTERNS.md) for common patterns
3. Check [DESIGN_TOKENS_REFERENCE.md](./DESIGN_TOKENS_REFERENCE.md) for colors/spacing
4. Start building your first prototype!

## Getting Help

- Review example-dashboard prototype for patterns
- Check component README files for usage examples
- Ask Claude Code: "Show me an example of using the Card component"
