# Engineering Handoff Template

Use this template when a prototype is validated and ready for production implementation.

---

# [Prototype Name] - Engineering Handoff

## Overview
[Brief description of what this prototype does and why it was built]

**Validation Status:** ✅ Validated with [N] users/stakeholders
**Priority:** [High/Medium/Low]
**Target Release:** [Version or date]

## Prototype Location
- **Path:** `src/prototypes/[prototype-name]/`
- **URL:** http://localhost:5173/prototypes/[prototype-name]
- **Branch:** `prototype/[prototype-name]`

## User Flow
[Describe the user flow step by step]

1. Step 1: User does X
2. Step 2: System shows Y
3. Step 3: User completes Z

## Prototype Structure

```
prototypes/[name]/
├── Step1.tsx          → scenes/[Scene]/[Feature]/Step1.tsx
├── Step2.tsx          → scenes/[Scene]/[Feature]/Step2.tsx
└── mockData.ts        → Replace with RTK Query
```

## Component Usage

All components used exist in production:
- [Component 1] - from `@terraware/web-components`
- [Component 2] - from `src/components/common/[Component2]`
- [Component 3] - New component needed (see below)

### New Components Needed
- **[Component Name]**: [Description of component and why it's needed]

## Data Integration

### API Endpoints Required

**1. [Endpoint Name]**
- **Method:** POST/GET/PUT/DELETE
- **Path:** `/api/[resource]/[action]`
- **Request:**
  ```json
  {
    "field1": "value",
    "field2": "value"
  }
  ```
- **Response:**
  ```json
  {
    "result": "value"
  }
  ```

### Mock Data → Real Data

```typescript
// Prototype:
const { data } = useMockData(mockData);

// Production:
const { data } = useGetResourceQuery();
```

### State Management

```typescript
// Prototype: Local state
const [value, setValue] = useState(initial);

// Production: Redux
const value = useAppSelector(selectValue);
const dispatch = useAppDispatch();
dispatch(updateValue(newValue));
```

## Business Rules

[Document any business logic, validation rules, or constraints]

- Rule 1: [Description]
- Rule 2: [Description]

## Edge Cases Handled

- [Edge case 1]: [How prototype handles it]
- [Edge case 2]: [How prototype handles it]

## Known Limitations

[Things the prototype doesn't handle that production needs to]

- Limitation 1: [Description]
- Limitation 2: [Description]

## Testing Scenarios

### Happy Path
1. [Scenario 1]
2. [Scenario 2]

### Error Cases
1. [Error scenario 1]
2. [Error scenario 2]

### Performance Considerations
- [Any data size or performance notes]

## Questions for Team

### Product Questions
- [ ] Question 1?
- [ ] Question 2?

### Engineering Questions
- [ ] Question 1?
- [ ] Question 2?

### Design Questions
- [ ] Question 1?
- [ ] Question 2?

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Related Resources

- **Figma:** [URL]
- **Zeroheight:** [URL to specific components]
- **Production Reference:** [Path to similar feature in production]
- **Prototype Demo Video:** [URL if available]

## Implementation Notes

[Any additional notes for engineers about implementation approach, technical considerations, etc.]

---

**Prepared by:** [PM Name]
**Date:** [Date]
**Prototype Version:** [Git commit or tag]
