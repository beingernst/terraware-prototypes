import type { ReactNode } from 'react';
import { Box, Container, useTheme } from '@mui/material';

export interface PageProps {
  children: ReactNode;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  padding?: number;
}

/**
 * Page layout component providing consistent page structure.
 *
 * This component is used inside the AppShell, which already provides
 * the TopNav and Sidebar. The Page component handles:
 * - Page title (h1)
 * - Content container with max-width
 * - Consistent padding
 *
 * @example
 * <Page title="Species Management" maxWidth="lg">
 *   <Card title="Species List">
 *     {content}
 *   </Card>
 * </Page>
 */
export function Page({
  children,
  title,
  maxWidth = 'lg',
  padding = 3,
}: PageProps) {
  const theme = useTheme();

  return (
    // Removed minHeight: 100vh since AppShell now handles the layout
    <Box>
      <Container maxWidth={maxWidth}>
        <Box padding={padding}>
          {title && (
            <Box mb={3}>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: theme.palette.TwClrTxt,
                  margin: 0,
                }}
              >
                {title}
              </h1>
            </Box>
          )}
          {children}
        </Box>
      </Container>
    </Box>
  );
}
