/**
 * Plan Screen Component - Matches original planting-planning prototype
 *
 * Shows either:
 * 1. Empty state with "Start My Plan" button
 * 2. Onboarding flow (2 steps)
 * 3. Full Gantt chart interface for managing planting seasons
 *
 * Features:
 * - Multiple planting sites with expand/collapse
 * - Visual month selection via Gantt chart
 * - Year tabs with add/remove functionality
 * - Wet season visualization
 * - Save/discard changes
 */

import { useState, useMemo, useCallback } from "react";
import { Page } from "@/components/layout";
import { Card } from "@/components/core";
import {
  Box,
  Typography,
  Checkbox,
  IconButton,
  Tabs,
  Tab,
  Modal,
} from "@mui/material";
import { Button } from "@terraware/web-components";
import {
  LocationOn as LocationIcon,
  Close as CloseIcon,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import {
  MONTHS,
  getSelectionPosition,
  getBorderRadiusForPosition,
} from "./mockData";

// Colors
const HEADER_BG = "#F5F5F0";
const SITE_BAR_BG = "#4A7C59"; // Darker green for site aggregate
const ZONE_BAR_BG = "#7DA88A"; // Lighter green for zone bars
const ZONE_BAR_HOVER = "#6B9A7A";
const BORDER_COLOR = "#E8E5E0";
const SITE_BORDER_COLOR = "#C8C5C0"; // Darker border between sites
const TEXT_PRIMARY = "#3A4445";
const TEXT_SECONDARY = "#6B7165";
const ZONE_ROW_BG = "#FAFAFA";
const WET_SEASON_BG = "rgba(181, 212, 232, 0.15)"; // Light blue for wet season
const WET_SEASON_ZONE_BG = "rgba(181, 212, 232, 0.08)"; // More desaturated for zones

// Type for tracking selected months per zone per year
type PlantingSchedule = Record<number, Record<string, Set<number>>>;

// Mock multiple sites for onboarding selection
const allSites = [
  {
    id: 1,
    name: "Montanha do Sul",
    location: "South Region, Brazil",
    area: "292 ha",
    zones: [
      { id: "1-a", name: "Zone A - Hillside", area: "85 ha" },
      { id: "1-b", name: "Zone B - Valley", area: "72 ha" },
      { id: "1-c", name: "Zone C - Riverside", area: "70 ha" },
      { id: "1-d", name: "Zone D - Forest Edge", area: "65 ha" },
    ],
    wetSeasonMonths: new Set([0, 1, 2, 10, 11]), // Nov-Mar
  },
  {
    id: 2,
    name: "Vale Verde",
    location: "Central Region, Brazil",
    area: "185 ha",
    zones: [
      { id: "2-a", name: "Zone A - North Section", area: "95 ha" },
      { id: "2-b", name: "Zone B - South Section", area: "90 ha" },
    ],
    wetSeasonMonths: new Set([0, 1, 2, 10, 11]), // Nov-Mar
  },
  {
    id: 3,
    name: "Floresta Norte",
    location: "North Region, Brazil",
    area: "420 ha",
    zones: [
      { id: "3-a", name: "Zone A - Upper Slopes", area: "180 ha" },
      { id: "3-b", name: "Zone B - Mid Elevation", area: "156 ha" },
      { id: "3-c", name: "Zone C - Lower Terraces", area: "84 ha" },
    ],
    wetSeasonMonths: new Set([0, 1, 2, 3, 10, 11]), // Nov-Apr
  },
];

// Helper to create initial empty schedule
function createInitialSchedule(years: number[], selectedSiteIds: number[]): PlantingSchedule {
  const initial: PlantingSchedule = {};
  years.forEach((year) => {
    initial[year] = {};
    allSites
      .filter((site) => selectedSiteIds.includes(site.id))
      .forEach((site) => {
        site.zones.forEach((zone) => {
          initial[year][zone.id] = new Set<number>();
        });
      });
  });
  return initial;
}

// Helper to deep clone schedule
function cloneSchedule(schedule: PlantingSchedule): PlantingSchedule {
  const cloned: PlantingSchedule = {};
  Object.keys(schedule).forEach((yearStr) => {
    const year = parseInt(yearStr);
    cloned[year] = {};
    Object.keys(schedule[year]).forEach((zoneId) => {
      cloned[year][zoneId] = new Set(schedule[year][zoneId]);
    });
  });
  return cloned;
}

// Helper to compare schedules
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

export default function PlanScreen() {
  // State for whether user has started planning
  const [hasPlan, setHasPlan] = useState(false);

  // Onboarding flow state
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingYear, setOnboardingYear] = useState<number | 'started' | null>(null);
  const [onboardingSites, setOnboardingSites] = useState<Set<number>>(new Set());

  // Main planning state (initialized after onboarding)
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set([1]));
  const [selectedSiteIds, setSelectedSiteIds] = useState<number[]>([]);

  // Schedule state
  const [savedSchedule, setSavedSchedule] = useState<PlantingSchedule>({});
  const [schedule, setSchedule] = useState<PlantingSchedule>({});

  // Delete year modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<number | null>(null);

  // Handle site toggle in onboarding
  const handleSiteToggle = (siteId: number) => {
    setOnboardingSites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(siteId)) {
        newSet.delete(siteId);
      } else {
        newSet.add(siteId);
      }
      return newSet;
    });
  };

  // Complete onboarding
  const completeOnboarding = () => {
    const startYear = typeof onboardingYear === 'number' ? onboardingYear : 2026;
    const yearsArray = [startYear, startYear + 1, startYear + 2, startYear + 3];
    const siteIds = Array.from(onboardingSites);

    setYears(yearsArray);
    setSelectedYear(startYear);
    setSelectedSiteIds(siteIds);

    const initialSchedule = createInitialSchedule(yearsArray, siteIds);
    setSavedSchedule(initialSchedule);
    setSchedule(cloneSchedule(initialSchedule));

    // Expand first site by default
    if (siteIds.length > 0) {
      setExpandedSites(new Set([siteIds[0]]));
    }

    setIsOnboarding(false);
    setHasPlan(true);
  };

  // Get selected sites
  const selectedSites = allSites.filter((site) => selectedSiteIds.includes(site.id));

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return !schedulesEqual(schedule, savedSchedule);
  }, [schedule, savedSchedule]);

  // Save changes
  const handleSave = useCallback(() => {
    setSavedSchedule(cloneSchedule(schedule));
  }, [schedule]);

  // Discard changes
  const handleDiscard = useCallback(() => {
    setSchedule(cloneSchedule(savedSchedule));
  }, [savedSchedule]);

  // Toggle site expansion
  const toggleSiteExpanded = (siteId: number) => {
    setExpandedSites((prev) => {
      const next = new Set(prev);
      if (next.has(siteId)) {
        next.delete(siteId);
      } else {
        next.add(siteId);
      }
      return next;
    });
  };

  // Toggle month for a zone
  const toggleMonth = (zoneId: string, monthIndex: number) => {
    setSchedule((prev) => {
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

  // Get aggregate months for a site (union of all zones)
  const getSiteAggregateMonths = (site: typeof allSites[0]): Set<number> => {
    const aggregate = new Set<number>();
    site.zones.forEach((zone) => {
      const zoneMonths = schedule[selectedYear]?.[zone.id];
      if (zoneMonths) {
        zoneMonths.forEach((month) => aggregate.add(month));
      }
    });
    return aggregate;
  };

  // Add year
  const handleAddYear = () => {
    const maxYear = Math.max(...years);
    const newYear = maxYear + 1;
    setYears([...years, newYear]);

    // Add year to schedules
    const updatedSchedule = { ...schedule };
    const updatedSaved = { ...savedSchedule };
    updatedSchedule[newYear] = {};
    updatedSaved[newYear] = {};

    selectedSites.forEach((site) => {
      site.zones.forEach((zone) => {
        updatedSchedule[newYear][zone.id] = new Set<number>();
        updatedSaved[newYear][zone.id] = new Set<number>();
      });
    });

    setSchedule(updatedSchedule);
    setSavedSchedule(updatedSaved);
  };

  // Remove year (with confirmation if has data)
  const handleRemoveYearClick = () => {
    if (years.length <= 1) return;
    const youngestYear = Math.max(...years);

    // Check if year has data
    const yearSchedule = schedule[youngestYear];
    const hasData = yearSchedule && Object.values(yearSchedule).some((months) => months.size > 0);

    if (hasData) {
      setYearToDelete(youngestYear);
      setDeleteConfirmOpen(true);
    } else {
      removeYear(youngestYear);
    }
  };

  const removeYear = (yearToRemove: number) => {
    setYears(years.filter((y) => y !== yearToRemove));

    const updatedSchedule = { ...schedule };
    const updatedSaved = { ...savedSchedule };
    delete updatedSchedule[yearToRemove];
    delete updatedSaved[yearToRemove];

    setSchedule(updatedSchedule);
    setSavedSchedule(updatedSaved);

    if (selectedYear === yearToRemove) {
      const remaining = years.filter((y) => y !== yearToRemove);
      setSelectedYear(remaining[0]);
    }
  };

  const handleConfirmDelete = () => {
    if (yearToDelete !== null) {
      removeYear(yearToDelete);
    }
    setDeleteConfirmOpen(false);
    setYearToDelete(null);
  };

  // Empty state view
  if (!hasPlan && !isOnboarding) {
    return (
      <Page title="Plan" maxWidth={false}>
        <Box
          sx={{
            p: 8,
            textAlign: "center",
            backgroundColor: "#FAFAFA",
            borderRadius: "8px",
            border: `1px dashed ${BORDER_COLOR}`,
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "600px",
            mx: "auto",
            mt: 4,
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocationIcon
              sx={{ fontSize: 80, color: "#FF6B35", opacity: 0.8 }}
            />
          </Box>

          <Typography
            sx={{
              color: TEXT_PRIMARY,
              fontSize: "18px",
              fontWeight: 500,
              mb: 2,
            }}
          >
            Start Your Planting Plan
          </Typography>

          <Typography
            sx={{
              color: TEXT_SECONDARY,
              fontSize: "14px",
              mb: 4,
            }}
          >
            Set your planting seasons up for success with tools to plan where
            you'll plant and what you'll need.
          </Typography>

          <Button
            label="Start My Plan"
            onClick={() => setIsOnboarding(true)}
            type="productive"
            priority="primary"
            size="medium"
          />
        </Box>
      </Page>
    );
  }

  // Onboarding flow
  if (isOnboarding) {
    return (
      <Page title="Plan" maxWidth={false}>
        {/* Progress indicator */}
        <Box
          sx={{
            mb: 4,
            pb: 3,
            borderBottom: `1px solid ${BORDER_COLOR}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            {[
              { num: 1, label: 'Start' },
              { num: 2, label: 'Add Planting Seasons' },
              { num: 3, label: 'Add Species' },
            ].map((step, index) => (
              <Box key={step.num} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: onboardingStep >= step.num ? '#4A7C59' : '#E8E5E0',
                      color: onboardingStep >= step.num ? '#FFF' : TEXT_SECONDARY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    {step.num}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: onboardingStep === step.num ? 600 : 400,
                      color: onboardingStep === step.num ? TEXT_PRIMARY : TEXT_SECONDARY,
                    }}
                  >
                    {step.label}
                  </Typography>
                </Box>
                {index < 2 && (
                  <Box
                    sx={{
                      width: 40,
                      height: 2,
                      backgroundColor: onboardingStep > step.num ? '#4A7C59' : '#E8E5E0',
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Content container */}
        <Box
          sx={{
            maxWidth: '700px',
            mx: 'auto',
            mt: 6,
          }}
        >
          {/* Step 1: Select start year */}
          {onboardingStep === 1 && (
            <Box>
              <Typography
                sx={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: TEXT_PRIMARY,
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Let's start planning your planting
              </Typography>
              <Typography
                sx={{
                  fontSize: '15px',
                  color: TEXT_SECONDARY,
                  mb: 1,
                  textAlign: 'center',
                }}
              >
                First, we'll ask you a few questions to customize your plan.
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: TEXT_SECONDARY,
                  mb: 5,
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                You can change any part of this later.
              </Typography>

              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 500,
                  color: TEXT_PRIMARY,
                  mb: 3,
                }}
              >
                First, when do you plan to start?
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[2026, 2027, 2028, 2029, 2030].map((year) => (
                  <Box
                    key={year}
                    onClick={() => {
                      setOnboardingYear(year);
                      setOnboardingStep(2);
                    }}
                    sx={{
                      p: 3,
                      border: `2px solid ${onboardingYear === year ? '#4A7C59' : BORDER_COLOR}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: onboardingYear === year ? '#F0F4F1' : '#FFF',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#4A7C59',
                        backgroundColor: '#F0F4F1',
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: '16px', fontWeight: 500, color: TEXT_PRIMARY }}>
                      {year}
                    </Typography>
                  </Box>
                ))}
                <Box
                  onClick={() => {
                    setOnboardingYear('started');
                    setOnboardingStep(2);
                  }}
                  sx={{
                    p: 3,
                    border: `2px solid ${onboardingYear === 'started' ? '#4A7C59' : BORDER_COLOR}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: onboardingYear === 'started' ? '#F0F4F1' : '#FFF',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#4A7C59',
                      backgroundColor: '#F0F4F1',
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '16px', fontWeight: 500, color: TEXT_PRIMARY }}>
                    I've already started
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Step 2: Select planting sites */}
          {onboardingStep === 2 && (
            <Box>
              <Typography
                sx={{
                  fontSize: '24px',
                  fontWeight: 600,
                  color: TEXT_PRIMARY,
                  mb: 5,
                  textAlign: 'center',
                }}
              >
                Select all the planting sites you think you will plant in{' '}
                {typeof onboardingYear === 'number' ? onboardingYear : 'the near future'}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {allSites.map((site) => (
                  <Box
                    key={site.id}
                    onClick={() => handleSiteToggle(site.id)}
                    sx={{
                      p: 3,
                      border: `2px solid ${onboardingSites.has(site.id) ? '#4A7C59' : BORDER_COLOR}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: onboardingSites.has(site.id) ? '#F0F4F1' : '#FFF',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      '&:hover': {
                        borderColor: '#4A7C59',
                        backgroundColor: '#F0F4F1',
                      },
                    }}
                  >
                    <Checkbox
                      checked={onboardingSites.has(site.id)}
                      sx={{
                        '& .MuiSvgIcon-root': { fontSize: 28 },
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '16px', fontWeight: 500, color: TEXT_PRIMARY }}>
                        {site.name}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: TEXT_SECONDARY }}>
                        {site.location} • {site.area}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 4 }}>
                <Button
                  label="Back"
                  onClick={() => setOnboardingStep(1)}
                  type="passive"
                />
                <Button
                  label="Continue to Plan"
                  onClick={completeOnboarding}
                  type="productive"
                  priority="primary"
                  disabled={onboardingSites.size === 0}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Page>
    );
  }

  // Main Gantt chart view (after onboarding)
  return (
    <Page title="Plan" maxWidth={false}>
      {/* Progress indicator - keep visible */}
      <Box
        sx={{
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {[
            { num: 1, label: 'Start' },
            { num: 2, label: 'Add Planting Seasons' },
            { num: 3, label: 'Add Species' },
          ].map((step, index) => (
            <Box key={step.num} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: step.num <= 2 ? '#4A7C59' : '#E8E5E0',
                    color: step.num <= 2 ? '#FFF' : TEXT_SECONDARY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {step.num}
                </Box>
                <Typography
                  sx={{
                    fontSize: '13px',
                    fontWeight: step.num === 2 ? 600 : 400,
                    color: step.num === 2 ? TEXT_PRIMARY : TEXT_SECONDARY,
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
              {index < 2 && (
                <Box
                  sx={{
                    width: 40,
                    height: 2,
                    backgroundColor: step.num < 2 ? '#4A7C59' : '#E8E5E0',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Sticky header with save/discard */}
      <Box
        sx={{
          position: 'sticky',
          top: 60,
          zIndex: 100,
          backgroundColor: hasChanges ? '#FFF' : 'rgb(249, 248, 247)',
          boxShadow: hasChanges ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
          transition: 'background-color 0.2s, box-shadow 0.2s',
          mb: 3,
          py: 2,
          px: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

      {/* Main Gantt Card */}
      <Card title="Planting Schedule">
        <Typography sx={{ color: TEXT_SECONDARY, mb: 2 }}>
          For each planting site, select the site zones you plan to plant each
          month of the year.
        </Typography>

        {/* Legend */}
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
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
              Site aggregate
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 16,
                backgroundColor: WET_SEASON_BG,
                borderRadius: '4px',
                border: '1px solid rgba(181, 212, 232, 0.5)',
              }}
            />
            <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY }}>
              Wet season
            </Typography>
          </Box>
        </Box>

        {/* Year Tabs */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `2px solid ${BORDER_COLOR}`,
            mb: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tabs
              value={selectedYear}
              onChange={(_, newYear) => setSelectedYear(newYear)}
              sx={{
                minHeight: 40,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: TEXT_SECONDARY,
                  minWidth: 60,
                  minHeight: 40,
                  py: 1,
                },
                '& .Mui-selected': {
                  color: `${SITE_BAR_BG} !important`,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: SITE_BAR_BG,
                },
              }}
            >
              {years.map((year) => (
                <Tab key={year} label={year} value={year} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {years.length > 1 && (
              <IconButton
                size="small"
                onClick={handleRemoveYearClick}
                sx={{ color: TEXT_SECONDARY }}
                title={`Remove ${Math.max(...years)}`}
              >
                <RemoveIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <IconButton
              size="small"
              onClick={handleAddYear}
              sx={{ color: TEXT_SECONDARY }}
              title="Add year"
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Gantt Chart */}
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 900 }}>
            {/* Header Row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '280px repeat(12, 1fr)',
                borderBottom: `1px solid ${BORDER_COLOR}`,
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
              {MONTHS.map((month, index) => {
                const yearShort = String(selectedYear).slice(-2);
                return (
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
                    {month} '{yearShort}
                  </Box>
                );
              })}
            </Box>

            {/* Site Rows */}
            {selectedSites.map((site, siteIndex) => {
              const isExpanded = expandedSites.has(site.id);
              const aggregateMonths = getSiteAggregateMonths(site);

              return (
                <Box key={site.id}>
                  {/* Site Row (aggregate) */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '280px repeat(12, 1fr)',
                      borderTop: siteIndex > 0 ? `1px solid ${SITE_BORDER_COLOR}` : 'none',
                      borderBottom: isExpanded ? `1px solid ${BORDER_COLOR}` : 'none',
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

                    {/* Month cells (aggregate view) */}
                    {MONTHS.map((_, monthIndex) => {
                      const selected = aggregateMonths.has(monthIndex);
                      const isWetMonth = site.wetSeasonMonths.has(monthIndex);
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
                            backgroundColor: isWetMonth ? WET_SEASON_BG : 'transparent',
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              height: 28,
                              backgroundColor: selected ? SITE_BAR_BG : 'transparent',
                              borderRadius: getBorderRadiusForPosition(position),
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Zone Rows (when expanded) */}
                  {isExpanded &&
                    site.zones.map((zone) => {
                      const zoneMonths = schedule[selectedYear]?.[zone.id] || new Set();

                      return (
                        <Box
                          key={zone.id}
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '280px repeat(12, 1fr)',
                            borderBottom: `1px solid ${BORDER_COLOR}`,
                            '&:hover': { backgroundColor: ZONE_ROW_BG },
                          }}
                        >
                          {/* Zone info */}
                          <Box
                            sx={{
                              p: 1.5,
                              pl: 6,
                              borderRight: `1px solid ${BORDER_COLOR}`,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize: '13px',
                                  color: TEXT_PRIMARY,
                                  lineHeight: 1.3,
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

                          {/* Month cells */}
                          {MONTHS.map((_, monthIndex) => {
                            const selected = zoneMonths.has(monthIndex);
                            const isWetMonth = site.wetSeasonMonths.has(monthIndex);
                            const position = getSelectionPosition(
                              (m) => zoneMonths.has(m),
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
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: isWetMonth ? WET_SEASON_ZONE_BG : 'transparent',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    backgroundColor: selected
                                      ? ZONE_BAR_HOVER
                                      : isWetMonth
                                        ? 'rgba(181, 212, 232, 0.25)'
                                        : 'rgba(125, 168, 138, 0.15)',
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: '100%',
                                    height: 24,
                                    backgroundColor: selected ? ZONE_BAR_BG : 'transparent',
                                    borderRadius: getBorderRadiusForPosition(position),
                                    transition: 'background-color 0.15s',
                                  }}
                                />
                              </Box>
                            );
                          })}
                        </Box>
                      );
                    })}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Card>

      {/* Delete Year Confirmation Modal */}
      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            backgroundColor: '#FFF',
            borderRadius: '8px',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Delete {yearToDelete}?
            </Typography>
            <IconButton onClick={() => setDeleteConfirmOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography sx={{ mb: 3, color: TEXT_SECONDARY }}>
            This year has planting data. Deleting it will permanently remove all selections for this year.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              label="Cancel"
              onClick={() => setDeleteConfirmOpen(false)}
              type="passive"
            />
            <Button
              label="Delete"
              onClick={handleConfirmDelete}
              type="destructive"
            />
          </Box>
        </Box>
      </Modal>
    </Page>
  );
}
