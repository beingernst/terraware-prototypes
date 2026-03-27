import { Page } from '@/components/layout';
import { Card } from '@/components/core';
import { Button } from '@terraware/web-components';
import { Typography, Box } from '@mui/material';

export function PrototypeHome() {
  const handleClick = () => {
    // Prototype click handler
  };

  return (
    <Page title="Prototype Template">
      <Card title="Getting Started">
        <Typography paragraph>
          This is a template for creating new prototypes.
        </Typography>
        <Typography paragraph>
          Replace this content with your prototype.
        </Typography>
        <Box mt={2}>
          <Button label="Example Button" onClick={handleClick} />
        </Box>
      </Card>
    </Page>
  );
}
