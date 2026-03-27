# Prototype Template

Use this as a starting point for new prototypes.

## Copy this template:

```bash
cp -r src/prototypes/_template src/prototypes/your-prototype-name
```

## Update files:
1. Rename components in index.tsx and PrototypeHome.tsx
2. Update this README.md with prototype description
3. Add route in src/App.tsx:
   ```tsx
   import YourPrototype from './prototypes/your-prototype-name';
   // ...
   <Route path="/prototypes/your-prototype-name/*" element={<YourPrototype />} />
   ```
4. Start building!

## Prototype Details

**Purpose:** [What is this prototype testing?]

**User Story:** [As a ___, I want to ___, so that ___]

**Key Features:**
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

**Status:** 🚧 In Progress / ✅ Validated / 📦 Handed Off
