import { Page } from '@/components/layout';
import { Card } from '@/components/core';
import { Button } from '@terraware/web-components';
import { Typography, Box } from '@mui/material';

export function PrototypeHome() {
  const handleClick = () => {
    // Prototype click handler
  };

  return (
    <Page title="M&E Test Prototype">
      <Card title="M&E Test Prototype">
        <Typography paragraph>
          This is the M&E (Monitoring & Evaluation) test prototype.
        </Typography>
        <Typography paragraph>
          Ready to build!
        </Typography>
        <Box mt={2}>
          <Button label="Example Button" onClick={handleClick} />
        </Box>
      </Card>
    </Page>
  );
}
