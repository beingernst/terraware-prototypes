import { useState, useMemo, useCallback } from 'react';
import { Page } from '@/components/layout';
import { Card } from '@/components/core';
import { Typography, Box, Tabs, Tab, Collapse, Modal, IconButton } from '@mui/material';
import { Button } from '@terraware/web-components';
import {
  LocationOn as LocationIcon,
  KeyboardArrowDown,
  KeyboardArrowRight,
  GridView as ZoneIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Colors
const HEADER_BG = '#F5F5F0';
const SITE_BAR_BG = '#4A7C59'; // Darker green for site aggregate (FLIPPED)
const ZONE_BAR_BG = '#7DA88A'; // Lighter green for zone bars (FLIPPED)
const ZONE_BAR_HOVER = '#6B9A7A';
const BORDER_COLOR = '#E8E5E0';
const TEXT_PRIMARY = '#3A4445';
const TEXT_SECONDARY = '#6B7165';
const ZONE_ROW_BG = '#FAFAFA';
const ZONE_HIGHLIGHT = '#4A7C59'; // For highlighted zone on map

// Sticky header styling
const STICKY_HEADER_BG = 'rgb(249, 248, 247)'; // Match page background

// Zone colors for map visualization
const ZONE_MAP_COLORS = [
  '#B8D4C8', // Light sage
  '#D4C8B8', // Light tan
  '#C8D4B8', // Light lime
  '#C8B8D4', // Light lavender
  '#D4B8C8', // Light rose
];

// Months for the Gantt chart
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Available years for planning
const YEARS = [2025, 2026, 2027, 2028];

// Zone type
interface Zone {
  id: string;
  name: string;
  area: string;
}

// Site type with zones
interface PlantingSite {
  id: number;
  name: string;
  location: string;
  area: string;
  zones: Zone[];
}

// Mock planting sites data with zones
const mockPlantingSites: PlantingSite[] = [
  {
    id: 1,
    name: 'Site 83',
    location: 'West Java, Indonesia',
    area: '227 ha',
    zones: [
      { id: '1-a', name: 'Zone A - Hillside', area: '85 ha' },
      { id: '1-b', name: 'Zone B - Valley', area: '72 ha' },
      { id: '1-c', name: 'Zone C - Riverside', area: '70 ha' },
    ],
  },
  {
    id: 2,
    name: 'Site 84',
    location: 'Central Java, Indonesia',
    area: '185 ha',
    zones: [
      { id: '2-a', name: 'Zone A - North Section', area: '95 ha' },
      { id: '2-b', name: 'Zone B - South Section', area: '90 ha' },
    ],
  },
  {
    id: 3,
    name: 'Northern Reserve',
    location: 'East Java, Indonesia',
    area: '312 ha',
    zones: [
      { id: '3-a', name: 'Zone A - Primary Forest', area: '150 ha' },
      { id: '3-b', name: 'Zone B - Degraded Area', area: '100 ha' },
      { id: '3-c', name: 'Zone C - Buffer Zone', area: '62 ha' },
    ],
  },
  {
    id: 4,
    name: 'Coastal Restoration',
    location: 'Bali, Indonesia',
    area: '98 ha',
    zones: [
      { id: '4-a', name: 'Zone A - Beach Front', area: '45 ha' },
      { id: '4-b', name: 'Zone B - Mangrove Area', area: '53 ha' },
    ],
  },
  {
    id: 5,
    name: 'Highland Project',
    location: 'Sumatra, Indonesia',
    area: '456 ha',
    zones: [
      { id: '5-a', name: 'Zone A - Upper Slopes', area: '180 ha' },
      { id: '5-b', name: 'Zone B - Mid Elevation', area: '156 ha' },
      { id: '5-c', name: 'Zone C - Lower Terraces', area: '120 ha' },
    ],
  },
];

// Type for tracking selected months per zone per year
// Structure: { year: { zoneId: Set<monthIndex> } }
type PlantingSchedule = Record<number, Record<string, Set<number>>>;

// Helper to format consecutive months as ranges
function formatMonthRanges(monthIndices: number[]): string {
  if (monthIndices.length === 0) return 'No months selected';

  const sorted = [...monthIndices].sort((a, b) => a - b);
  const ranges: string[] = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === rangeEnd + 1) {
      rangeEnd = sorted[i];
    } else {
      if (rangeStart === rangeEnd) {
        ranges.push(MONTH_NAMES_FULL[rangeStart]);
      } else {
        ranges.push(`${MONTH_NAMES_FULL[rangeStart]} through ${MONTH_NAMES_FULL[rangeEnd]}`);
      }
      if (i < sorted.length) {
        rangeStart = sorted[i];
        rangeEnd = sorted[i];
      }
    }
  }

  return ranges.join(', ');
}

// Helper to create initial schedule data
function createInitialSchedule(): PlantingSchedule {
  const initial: PlantingSchedule = {};
  YEARS.forEach(year => {
    initial[year] = {};
    mockPlantingSites.forEach(site => {
      site.zones.forEach(zone => {
        initial[year][zone.id] = new Set<number>();
      });
    });
  });
  // Pre-select some months for demo (2025)
  initial[2025]['1-a'] = new Set([2, 3, 4]); // Site 83, Zone A: Mar-May
  initial[2025]['1-b'] = new Set([3, 4, 5]); // Site 83, Zone B: Apr-Jun
  initial[2025]['1-c'] = new Set([4, 5]); // Site 83, Zone C: May-Jun
  initial[2025]['2-a'] = new Set([9, 10, 11]); // Site 84, Zone A: Oct-Dec
  initial[2025]['2-b'] = new Set([10, 11]); // Site 84, Zone B: Nov-Dec
  initial[2025]['3-a'] = new Set([3, 4, 5, 6]); // Northern Reserve, Zone A: Apr-Jul
  // Some 2026 data
  initial[2026]['1-a'] = new Set([1, 2, 3]); // Site 83, Zone A: Feb-Apr
  initial[2026]['1-b'] = new Set([7, 8, 9]); // Site 83, Zone B: Aug-Oct
  initial[2026]['4-a'] = new Set([4, 5]); // Coastal, Zone A: May-Jun
  return initial;
}

// Helper to deep clone schedule (for comparison)
function cloneSchedule(schedule: PlantingSchedule): PlantingSchedule {
  const cloned: PlantingSchedule = {};
  Object.keys(schedule).forEach(yearStr => {
    const year = parseInt(yearStr);
    cloned[year] = {};
    Object.keys(schedule[year]).forEach(zoneId => {
      cloned[year][zoneId] = new Set(schedule[year][zoneId]);
    });
  });
  return cloned;
}

// Helper to compare two schedules
function schedulesEqual(a: PlantingSchedule, b: PlantingSchedule): boolean {
  const yearsA = Object.keys(a);
  const yearsB = Object.keys(b);
  if (yearsA.length !== yearsB.length) return false;

  for (const yearStr of yearsA) {
    const year = parseInt(yearStr);
    const zonesA = Object.keys(a[year]);
    const zonesB = Object.keys(b[year] || {});
    if (zonesA.length !== zonesB.length) return false;

    for (const zoneId of zonesA) {
      const setA = a[year][zoneId];
      const setB = b[year]?.[zoneId];
      if (!setB || setA.size !== setB.size) return false;
      for (const month of setA) {
        if (!setB.has(month)) return false;
      }
    }
  }
  return true;
}

export function PlanningHome() {
  // Currently selected year
  const [selectedYear, setSelectedYear] = useState(2025);

  // Track which sites are expanded
  const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set([1])); // Start with Site 83 expanded

  // Store the initial/saved schedule state
  const [savedSchedule, setSavedSchedule] = useState<PlantingSchedule>(() => createInitialSchedule());

  // Track which months are selected for each zone per year (working copy)
  const [schedule, setSchedule] = useState<PlantingSchedule>(() => cloneSchedule(savedSchedule));

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return !schedulesEqual(schedule, savedSchedule);
  }, [schedule, savedSchedule]);

  // Save changes
  const handleSave = useCallback(() => {
    setSavedSchedule(cloneSchedule(schedule));
    // In a real app, this would also persist to the server
  }, [schedule]);

  // Discard changes
  const handleDiscard = useCallback(() => {
    setSchedule(cloneSchedule(savedSchedule));
  }, [savedSchedule]);

  // Zone map modal state
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [selectedZoneForMap, setSelectedZoneForMap] = useState<{
    site: PlantingSite;
    zone: Zone;
  } | null>(null);

  // Open zone map modal
  const openZoneMap = (site: PlantingSite, zone: Zone) => {
    setSelectedZoneForMap({ site, zone });
    setZoneModalOpen(true);
  };

  // Close zone map modal
  const closeZoneMap = () => {
    setZoneModalOpen(false);
    setSelectedZoneForMap(null);
  };

  // Toggle site expansion
  const toggleSiteExpanded = (siteId: number) => {
    setExpandedSites(prev => {
      const next = new Set(prev);
      if (next.has(siteId)) {
        next.delete(siteId);
      } else {
        next.add(siteId);
      }
      return next;
    });
  };

  // Toggle a month selection for a zone
  const toggleMonth = (zoneId: string, monthIndex: number) => {
    setSchedule(prev => {
      const newSchedule = { ...prev };
      const yearSchedule = { ...prev[selectedYear] };
      const zoneMonths = new Set(prev[selectedYear][zoneId] || []);

      if (zoneMonths.has(monthIndex)) {
        zoneMonths.delete(monthIndex);
      } else {
        zoneMonths.add(monthIndex);
      }

      yearSchedule[zoneId] = zoneMonths;
      newSchedule[selectedYear] = yearSchedule;
      return newSchedule;
    });
  };

  // Check if a month is selected for a zone
  const isZoneMonthSelected = (zoneId: string, monthIndex: number) => {
    return schedule[selectedYear]?.[zoneId]?.has(monthIndex) || false;
  };

  // Get aggregate selection for a site (union of all zones)
  const getSiteAggregateMonths = (site: PlantingSite): Set<number> => {
    const aggregate = new Set<number>();
    site.zones.forEach(zone => {
      const zoneMonths = schedule[selectedYear]?.[zone.id];
      if (zoneMonths) {
        zoneMonths.forEach(month => aggregate.add(month));
      }
    });
    return aggregate;
  };

  // Check if this cell is part of a contiguous selection (for rounded corners)
  const getSelectionPosition = (
    isSelectedFn: (monthIndex: number) => boolean,
    monthIndex: number
  ) => {
    const selected = isSelectedFn(monthIndex);
    if (!selected) return null;

    const prevSelected = monthIndex > 0 && isSelectedFn(monthIndex - 1);
    const nextSelected = monthIndex < 11 && isSelectedFn(monthIndex + 1);

    if (!prevSelected && !nextSelected) return 'single';
    if (!prevSelected) return 'start';
    if (!nextSelected) return 'end';
    return 'middle';
  };

  return (
    <Page>
      {/* TODO: Future enhancements to explore:
          - Planning seasons that span multiple years
          - Repeating seasons across years */}

      {/* Sticky Header with Title and Action Buttons */}
      <Box
        sx={{
          position: 'sticky',
          top: 60, // Below the TopNav
          zIndex: 100,
          backgroundColor: hasChanges ? '#FFF' : STICKY_HEADER_BG,
          mx: -3, // Extend to page edges
          px: 3,
          py: 2.5,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${BORDER_COLOR}`,
          boxShadow: hasChanges ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          transition: 'background-color 0.2s, box-shadow 0.2s',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            component="h1"
            sx={{
              fontSize: '24px',
              fontWeight: 600,
              color: TEXT_PRIMARY,
              margin: 0,
            }}
          >
            Planting Planning
          </Typography>
          {hasChanges && (
            <Box
              sx={{
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                fontSize: '12px',
                fontWeight: 500,
                px: 1.5,
                py: 0.5,
                borderRadius: '4px',
              }}
            >
              Unsaved changes
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            label="Discard Changes"
            onClick={handleDiscard}
            disabled={!hasChanges}
            type="passive"
            priority="secondary"
            size="medium"
          />
          <Button
            label="Save Changes"
            onClick={handleSave}
            disabled={!hasChanges}
            type="productive"
            priority="primary"
            size="medium"
          />
        </Box>
      </Box>

      <Card title="Planting Schedule">
        <Typography sx={{ color: TEXT_SECONDARY, mb: 2 }}>
          Click on a site to expand and set planting periods for individual zones.
        </Typography>

        {/* Year Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: BORDER_COLOR, mb: 3 }}>
          <Tabs
            value={selectedYear}
            onChange={(_, newYear) => setSelectedYear(newYear)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                color: TEXT_SECONDARY,
                minWidth: 80,
              },
              '& .Mui-selected': {
                color: `${SITE_BAR_BG} !important`,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: SITE_BAR_BG,
              },
            }}
          >
            {YEARS.map(year => (
              <Tab key={year} label={year} value={year} />
            ))}
          </Tabs>
        </Box>

        {/* Gantt Chart Container */}
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 900 }}>
            {/* Header Row - Months */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '280px repeat(12, 1fr)',
                borderBottom: `2px solid ${BORDER_COLOR}`,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: HEADER_BG,
                  borderRight: `1px solid ${BORDER_COLOR}`,
                  fontWeight: 600,
                  fontSize: '13px',
                  color: TEXT_PRIMARY,
                }}
              >
                Planting Site / Zone
              </Box>
              {MONTHS.map((month, index) => (
                <Box
                  key={month}
                  sx={{
                    p: 1,
                    backgroundColor: HEADER_BG,
                    borderRight: index < 11 ? `1px solid ${BORDER_COLOR}` : 'none',
                    textAlign: 'center',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: TEXT_SECONDARY,
                  }}
                >
                  {month}
                </Box>
              ))}
            </Box>

            {/* Site Rows with expandable Zones */}
            {mockPlantingSites.map((site, siteIndex) => {
              const isExpanded = expandedSites.has(site.id);
              const aggregateMonths = getSiteAggregateMonths(site);

              return (
                <Box key={site.id}>
                  {/* Site Row (clickable to expand) */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '280px repeat(12, 1fr)',
                      borderBottom: `1px solid ${BORDER_COLOR}`,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                    onClick={() => toggleSiteExpanded(site.id)}
                  >
                    {/* Site info */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRight: `1px solid ${BORDER_COLOR}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {/* Expand/Collapse icon */}
                      <Box sx={{ color: TEXT_SECONDARY, display: 'flex' }}>
                        {isExpanded ? (
                          <KeyboardArrowDown sx={{ fontSize: 20 }} />
                        ) : (
                          <KeyboardArrowRight sx={{ fontSize: 20 }} />
                        )}
                      </Box>
                      <LocationIcon sx={{ color: TEXT_SECONDARY, fontSize: 20 }} />
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 500,
                            fontSize: '14px',
                            color: TEXT_PRIMARY,
                            lineHeight: 1.3,
                          }}
                        >
                          {site.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: '12px',
                            color: TEXT_SECONDARY,
                            lineHeight: 1.3,
                          }}
                        >
                          {site.location} · {site.area} · {site.zones.length} zones
                        </Typography>
                      </Box>
                    </Box>

                    {/* Aggregate month cells (read-only, shows combined zones) */}
                    {MONTHS.map((_, monthIndex) => {
                      const selected = aggregateMonths.has(monthIndex);
                      const position = getSelectionPosition(
                        (m) => aggregateMonths.has(m),
                        monthIndex
                      );

                      return (
                        <Box
                          key={monthIndex}
                          sx={{
                            p: 0.5,
                            borderRight: monthIndex < 11 ? `1px solid ${BORDER_COLOR}` : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              height: 28,
                              backgroundColor: selected ? SITE_BAR_BG : 'transparent',
                              borderRadius: position === 'single' ? '6px' :
                                            position === 'start' ? '6px 0 0 6px' :
                                            position === 'end' ? '0 6px 6px 0' : '0',
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Zone Rows (collapsible) */}
                  <Collapse in={isExpanded}>
                    {site.zones.map((zone, zoneIndex) => (
                      <Box
                        key={zone.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '280px repeat(12, 1fr)',
                          borderBottom: zoneIndex < site.zones.length - 1 || siteIndex < mockPlantingSites.length - 1
                            ? `1px solid ${BORDER_COLOR}`
                            : 'none',
                          backgroundColor: ZONE_ROW_BG,
                          '&:hover': {
                            backgroundColor: '#F5F5F5',
                          },
                        }}
                      >
                        {/* Zone info (indented) - clickable to open map */}
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            openZoneMap(site, zone);
                          }}
                          sx={{
                            p: 1.5,
                            pl: 6,
                            borderRight: `1px solid ${BORDER_COLOR}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: '#F0F0F0',
                            },
                          }}
                        >
                          <ZoneIcon sx={{ color: TEXT_SECONDARY, fontSize: 18 }} />
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 400,
                                fontSize: '13px',
                                color: TEXT_PRIMARY,
                                lineHeight: 1.3,
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {zone.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '11px',
                                color: TEXT_SECONDARY,
                                lineHeight: 1.3,
                              }}
                            >
                              {zone.area}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Zone month cells (editable) */}
                        {MONTHS.map((_, monthIndex) => {
                          const selected = isZoneMonthSelected(zone.id, monthIndex);
                          const position = getSelectionPosition(
                            (m) => isZoneMonthSelected(zone.id, m),
                            monthIndex
                          );

                          return (
                            <Box
                              key={monthIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMonth(zone.id, monthIndex);
                              }}
                              sx={{
                                p: 0.5,
                                borderRight: monthIndex < 11 ? `1px solid ${BORDER_COLOR}` : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background-color 0.15s',
                                '&:hover': {
                                  backgroundColor: selected
                                    ? ZONE_BAR_HOVER
                                    : 'rgba(125, 168, 138, 0.2)',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  width: '100%',
                                  height: 24,
                                  backgroundColor: selected ? ZONE_BAR_BG : 'transparent',
                                  borderRadius: position === 'single' ? '5px' :
                                                position === 'start' ? '5px 0 0 5px' :
                                                position === 'end' ? '0 5px 5px 0' : '0',
                                  transition: 'background-color 0.15s',
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 16,
                backgroundColor: SITE_BAR_BG,
                borderRadius: '4px',
              }}
            />
            <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY }}>
              Site aggregate (combined zones)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 16,
                backgroundColor: ZONE_BAR_BG,
                borderRadius: '4px',
              }}
            />
            <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY }}>
              Zone planting period
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY }}>
            · Click site rows to expand · Click zone name to view map · Click cells to edit
          </Typography>
        </Box>

        {/* Summary */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: HEADER_BG,
            borderRadius: '8px',
          }}
        >
          <Typography sx={{ fontWeight: 500, fontSize: '14px', color: TEXT_PRIMARY, mb: 1 }}>
            {selectedYear} Planning Summary
          </Typography>
          {mockPlantingSites.map(site => {
            const hasAnyPlanning = site.zones.some(zone => {
              const months = schedule[selectedYear]?.[zone.id];
              return months && months.size > 0;
            });

            if (!hasAnyPlanning) {
              return (
                <Typography
                  key={site.id}
                  sx={{ fontSize: '13px', color: TEXT_SECONDARY, mb: 0.5 }}
                >
                  <strong>{site.name}:</strong> No months selected
                </Typography>
              );
            }

            return (
              <Box key={site.id} sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: '13px', color: TEXT_PRIMARY, fontWeight: 500 }}>
                  {site.name}:
                </Typography>
                {site.zones.map(zone => {
                  const selectedMonths = Array.from(schedule[selectedYear]?.[zone.id] || []);
                  if (selectedMonths.length === 0) return null;

                  return (
                    <Typography
                      key={zone.id}
                      sx={{ fontSize: '12px', color: TEXT_SECONDARY, ml: 2 }}
                    >
                      {zone.name}: {formatMonthRanges(selectedMonths)}
                    </Typography>
                  );
                })}
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* Zone Map Modal */}
      <Modal
        open={zoneModalOpen}
        onClose={closeZoneMap}
        aria-labelledby="zone-map-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 700,
            maxWidth: '90vw',
            bgcolor: 'white',
            borderRadius: '12px',
            boxShadow: 24,
            outline: 'none',
          }}
        >
          {selectedZoneForMap && (
            <>
              {/* Modal Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2.5,
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    {selectedZoneForMap.site.name}
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: TEXT_SECONDARY }}>
                    {selectedZoneForMap.site.location} · {selectedZoneForMap.site.area}
                  </Typography>
                </Box>
                <IconButton onClick={closeZoneMap} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Map Placeholder */}
              <Box sx={{ p: 3 }}>
                <Box
                  sx={{
                    backgroundColor: '#E8EDE5',
                    borderRadius: '8px',
                    height: 350,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Simulated zone map - divide into zones */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Typography
                      sx={{
                        fontSize: '11px',
                        color: TEXT_SECONDARY,
                        mb: 1,
                        textAlign: 'center',
                      }}
                    >
                      [Placeholder: Satellite Map View]
                    </Typography>

                    {/* Zone visualization */}
                    <Box
                      sx={{
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns: selectedZoneForMap.site.zones.length === 2
                          ? '1fr 1fr'
                          : '1fr 1fr 1fr',
                        gridTemplateRows: selectedZoneForMap.site.zones.length > 3 ? '1fr 1fr' : '1fr',
                        gap: 1,
                        p: 1,
                      }}
                    >
                      {selectedZoneForMap.site.zones.map((zone, index) => {
                        const isHighlighted = zone.id === selectedZoneForMap.zone.id;
                        return (
                          <Box
                            key={zone.id}
                            sx={{
                              backgroundColor: isHighlighted
                                ? ZONE_HIGHLIGHT
                                : ZONE_MAP_COLORS[index % ZONE_MAP_COLORS.length],
                              borderRadius: '8px',
                              border: isHighlighted
                                ? '3px solid #2D5A3D'
                                : '1px solid rgba(0,0,0,0.1)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              p: 2,
                              transition: 'all 0.2s',
                              boxShadow: isHighlighted
                                ? '0 4px 12px rgba(74, 124, 89, 0.3)'
                                : 'none',
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '14px',
                                fontWeight: isHighlighted ? 600 : 500,
                                color: isHighlighted ? 'white' : TEXT_PRIMARY,
                                textAlign: 'center',
                              }}
                            >
                              {zone.name.split(' - ')[0]}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '11px',
                                color: isHighlighted ? 'rgba(255,255,255,0.85)' : TEXT_SECONDARY,
                                textAlign: 'center',
                              }}
                            >
                              {zone.name.split(' - ')[1] || ''}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: isHighlighted ? 'white' : TEXT_PRIMARY,
                                mt: 1,
                              }}
                            >
                              {zone.area}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>

                {/* Selected Zone Details */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: HEADER_BG,
                    borderRadius: '8px',
                  }}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: '14px', color: TEXT_PRIMARY, mb: 0.5 }}>
                    {selectedZoneForMap.zone.name}
                  </Typography>
                  <Typography sx={{ fontSize: '13px', color: TEXT_SECONDARY }}>
                    Area: {selectedZoneForMap.zone.area}
                  </Typography>
                  {(() => {
                    const selectedMonths = Array.from(
                      schedule[selectedYear]?.[selectedZoneForMap.zone.id] || []
                    );
                    return (
                      <Typography sx={{ fontSize: '13px', color: TEXT_SECONDARY, mt: 0.5 }}>
                        {selectedYear} Planting: {formatMonthRanges(selectedMonths)}
                      </Typography>
                    );
                  })()}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Page>
  );
}
