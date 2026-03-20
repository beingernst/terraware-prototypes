/**
 * Progress Screen Component
 *
 * Shows empty state prompting user to create a Plan first.
 * In a full implementation, this would track planting progress
 * against the plan created in the Plan screen.
 */

import { useNavigate } from 'react-router';
import { Page } from '@/components/layout';
import { Box, Typography } from '@mui/material';
import { Button } from '@terraware/web-components';
import { TrendingUp as ProgressIcon } from '@mui/icons-material';

// Colors
const TEXT_SECONDARY = '#6B7165';
const BORDER_COLOR = '#E8E5E0';

export default function ProgressScreen() {
  const navigate = useNavigate();

  return (
    <Page title="Progress" maxWidth={false}>
      <Box
        sx={{
          p: 8,
          textAlign: 'center',
          backgroundColor: '#FAFAFA',
          borderRadius: '8px',
          border: `1px dashed ${BORDER_COLOR}`,
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '600px',
          mx: 'auto',
          mt: 4,
        }}
      >
        <ProgressIcon sx={{ fontSize: 64, color: '#C8C5C0', mb: 3 }} />

        <Typography
          variant="h6"
          sx={{
            color: TEXT_SECONDARY,
            mb: 2,
            fontWeight: 500,
          }}
        >
          No Plan Created Yet
        </Typography>

        <Typography
          sx={{
            color: TEXT_SECONDARY,
            mb: 4,
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          You need to create a planting plan before you can track progress.
          Start by setting up planting seasons and defining your species targets.
        </Typography>

        <Button
          label="Go to Plan"
          onClick={() => navigate('/prototypes/planting-planning-3/plan')}
          type="productive"
          priority="primary"
        />
      </Box>
    </Page>
  );
}
