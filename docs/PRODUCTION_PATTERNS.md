# Production Patterns Reference

Common patterns extracted from terraware-web for use in prototypes.

## Page Layouts

### Standard Page with Card

```tsx
<Page title="Page Title" maxWidth="lg">
  <Card title="Section Title">
    {/* content */}
  </Card>
</Page>
```

**Production:** Common pattern across scenes

---

### Two-Column Layout

```tsx
import { Grid } from '@mui/material';

<Page title="Project Details">
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, md: 8 }}>
      <Card title="Main Content">
        {/* primary content */}
      </Card>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <Card title="Sidebar">
        {/* secondary content */}
      </Card>
    </Grid>
  </Grid>
</Page>
```

---

## Forms

### Form Layout with Grid

```tsx
import { Grid, Box } from '@mui/material';
import { Button, Textfield } from '@terraware/web-components';

<form onSubmit={handleSubmit}>
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, md: 6 }}>
      <Textfield label="First Name" />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
      <Textfield label="Last Name" />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <Textfield label="Email" type="email" />
    </Grid>
  </Grid>

  <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
    <Button label="Cancel" priority="secondary" onClick={handleCancel} />
    <Button label="Save" type="submit" />
  </Box>
</form>
```

**Production:** `terraware-web/src/components/common/PageForm.tsx`

---

## Tables

### Simple Table with Data

```tsx
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

<Table>
  <TableHead>
    <TableRow>
      <TableCell>Name</TableCell>
      <TableCell>Status</TableCell>
      <TableCell>Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {data.map(row => (
      <TableRow key={row.id}>
        <TableCell>{row.name}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell>
          <Link onClick={() => handleView(row.id)}>View</Link>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Spacing & Styling

### Common Spacing Patterns

```tsx
import { Box, useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      padding={3}                           // 24px
      marginBottom={theme.spacing(2)}       // 16px
      borderRadius={theme.spacing(3)}       // 24px (card radius)
    >
      {/* content */}
    </Box>
  );
}
```

**Common values:**
- Card padding: `padding={3}` (24px)
- Card border radius: `borderRadius={theme.spacing(3)}` (24px)
- Section spacing: `marginBottom={theme.spacing(3)}` (24px)
- Button spacing: `marginLeft={theme.spacing(2)}` (16px)

---

### Using Theme Colors

```tsx
import { Box, Typography, useTheme } from '@mui/material';

function MyComponent() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.TwClrBg,
        borderBottom: `1px solid ${theme.palette.TwClrBrdrTertiary}`,
      }}
    >
      <Typography color={theme.palette.TwClrTxt}>
        Text content
      </Typography>
    </Box>
  );
}
```

---

## Loading States

### Card with Loading

```tsx
const { data, loading } = useMockData(mockData);

<Card title="Data" busy={loading}>
  {data && (
    <div>
      {/* render data */}
    </div>
  )}
</Card>
```

---

## Responsive Patterns

### Mobile-Aware Layout

```tsx
import { useDeviceInfo } from '@/shared/hooks/useDeviceInfo';

function MyComponent() {
  const { isMobile } = useDeviceInfo();

  return (
    <Grid container spacing={isMobile ? 2 : 3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card flushMobile={true}>
          {/* Card goes edge-to-edge on mobile */}
        </Card>
      </Grid>
    </Grid>
  );
}
```

---

## Multi-Step Workflows

### Step Navigation Pattern

```tsx
import { useState } from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';
import { Button } from '@terraware/web-components';

const steps = ['Details', 'Review', 'Confirm'];

function MultiStepForm() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);

  return (
    <Page title="Import Workflow">
      <Card>
        <Stepper activeStep={activeStep}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box mt={3}>
          {/* Step content here */}
        </Box>

        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            label="Back"
            priority="secondary"
            onClick={handleBack}
            disabled={activeStep === 0}
          />
          <Button
            label="Continue"
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
          />
        </Box>
      </Card>
    </Page>
  );
}
```

---

## References

For more patterns, see:
- `terraware-web/src/components/common/` - Reusable components
- `terraware-web/src/scenes/` - Page-level patterns
- Zeroheight: https://zeroheight.com/55ab6cc27/p/5447b0-terraware-capture
