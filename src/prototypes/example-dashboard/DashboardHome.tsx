import {
  Box,
  Typography,
  Grid2 as Grid,
  Select,
  MenuItem,
} from "@mui/material";
import { Button } from "@terraware/web-components";
import {
  Park as PlantsIcon,
  FormatListBulleted as SpeciesIcon,
  Spa as SeedsIcon,
  Yard as SeedlingsIcon,
  PhoneIphone as PhoneIcon,
} from "@mui/icons-material";
import { Link } from "@/components/core";

// Colors matching production
const CARD_BG = "#FFFFFF";
const ICON_BG = "#F5F5F0";
const TEXT_PRIMARY = "#3A4445";
const TEXT_SECONDARY = "#6B7165";
const BORDER_COLOR = "#E8E8E3";

// Stat item component for the Plants card
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: "12px",
          color: TEXT_SECONDARY,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 600,
          color: TEXT_PRIMARY,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// Column widths for alignment across cards
const ICON_COL_WIDTH = 160;
const STAT_COL_WIDTH = 220;
const BUTTON_COL_WIDTH = 180;

// Summary card component (for Species, Seeds, Seedlings)
function SummaryCard({
  icon,
  title,
  stats,
  linkText,
  buttonLabel,
  onButtonClick,
}: {
  icon: React.ReactNode;
  title: string;
  stats: { label: string; value: string; hasLink?: boolean }[];
  linkText?: string;
  buttonLabel: string;
  onButtonClick: () => void;
}) {
  return (
    <Box
      sx={{
        backgroundColor: CARD_BG,
        borderRadius: "12px",
        display: "flex",
        alignItems: "stretch",
        minHeight: 120,
        overflow: "hidden",
      }}
    >
      {/* Icon section */}
      <Box
        sx={{
          backgroundColor: ICON_BG,
          py: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          width: ICON_COL_WIDTH,
          flexShrink: 0,
        }}
      >
        <Box sx={{ color: TEXT_SECONDARY }}>{icon}</Box>
        <Typography
          sx={{ fontSize: "14px", fontWeight: 500, color: TEXT_PRIMARY }}
        >
          {title}
        </Typography>
      </Box>

      {/* Stats section with dividers */}
      {stats.map((stat, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 3,
            width: STAT_COL_WIDTH,
            flexShrink: 0,
            borderLeft: `1px solid ${BORDER_COLOR}`,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "14px", fontWeight: 500, color: TEXT_PRIMARY, mb: 0.5 }}>
              {stat.label}
            </Typography>
            <Typography
              sx={{ fontSize: "32px", fontWeight: 400, color: TEXT_PRIMARY, lineHeight: 1.2 }}
            >
              {stat.value}
            </Typography>
            {linkText && stat.hasLink && (
              <Link to="#" fontSize="14px">
                {linkText}
              </Link>
            )}
          </Box>
        </Box>
      ))}

      {/* Button section with divider */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: BUTTON_COL_WIDTH,
          flexShrink: 0,
          ml: "auto",
          borderLeft: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Button label={buttonLabel} onClick={onButtonClick} type="productive" priority="secondary" />
      </Box>
    </Box>
  );
}

export function DashboardHome() {
  const handleClick = () => {
    // Prototype click handler
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Welcome Header */}
      <Typography
        sx={{
          fontSize: "24px",
          fontWeight: 600,
          color: TEXT_PRIMARY,
          mb: 3,
        }}
      >
        Welcome to Terraware, Clara!
      </Typography>

      {/* Plants Card */}
      <Box
        sx={{
          backgroundColor: CARD_BG,
          borderRadius: "12px",
          border: `1px solid ${BORDER_COLOR}`,
          mb: 2,
          overflow: "hidden",
        }}
      >
        <Grid container>
          {/* Left side - Icon and Stats */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ p: 2.5 }}>
              {/* Header row with icon and site selector */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  mb: 2,
                }}
              >
                {/* Plants icon */}
                <Box
                  sx={{
                    backgroundColor: ICON_BG,
                    borderRadius: "8px",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <PlantsIcon sx={{ color: TEXT_SECONDARY, fontSize: 28 }} />
                  <Typography
                    sx={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: TEXT_PRIMARY,
                    }}
                  >
                    Plants
                  </Typography>
                </Box>

                {/* Site selector */}
                <Box>
                  <Typography
                    sx={{ fontSize: "12px", color: TEXT_SECONDARY, mb: 0.5 }}
                  >
                    Planting Site:
                  </Typography>
                  <Select
                    value="site-83"
                    size="small"
                    sx={{
                      fontSize: "13px",
                      "& .MuiSelect-select": { py: 0.5, px: 1 },
                      minWidth: 100,
                    }}
                  >
                    <MenuItem value="site-83">Site 83</MenuItem>
                    <MenuItem value="site-84">Site 84</MenuItem>
                  </Select>
                </Box>
              </Box>

              {/* Stats Grid */}
              <Grid container spacing={2}>
                <Grid size={6}>
                  <StatItem label="Location" value="Indonesia" />
                </Grid>
                <Grid size={6}>
                  <StatItem label="Area" value="227 ha" />
                </Grid>
                <Grid size={6}>
                  <StatItem
                    label="Date of Last Observation"
                    value="2024-10-23"
                  />
                </Grid>
                <Grid size={6}>
                  <StatItem label="Mortality Rate" value="-" />
                </Grid>
                <Grid size={6}>
                  <StatItem label="Total Plants Planted" value="-" />
                </Grid>
                <Grid size={6}>
                  <StatItem label="Total Species Planted" value="-" />
                </Grid>
              </Grid>

              {/* Links */}
              <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
                <Link to="#" fontSize="12px">
                  Add Planting Site
                </Link>
                <Link to="#" fontSize="12px">
                  View Full Dashboard
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Right side - Map */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box
              sx={{
                height: "100%",
                minHeight: 280,
                backgroundColor: "#E8EDE5",
                backgroundImage:
                  'url("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/106.8456,-6.2088,12,0/600x400?access_token=pk.placeholder")',
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Map placeholder */}
              <Typography sx={{ color: TEXT_SECONDARY, fontSize: "14px" }}>
                [Placeholder: Map View of Planting Site]
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Species Card */}
      <Box sx={{ mb: 2 }}>
        <SummaryCard
          icon={<SpeciesIcon sx={{ fontSize: 28 }} />}
          title="Species"
          stats={[
            { label: "Total Species", value: "3" },
            { label: "Species Last Updated", value: "2025-10-20" },
          ]}
          buttonLabel="Add Species"
          onButtonClick={handleClick}
        />
      </Box>

      {/* Seeds Card */}
      <Box sx={{ mb: 2 }}>
        <SummaryCard
          icon={<SeedsIcon sx={{ fontSize: 28 }} />}
          title="Seeds"
          stats={[
            { label: "Total Seed Count", value: "0" },
            { label: "Total Active Accessions", value: "0", hasLink: true },
          ]}
          linkText="View Full Dashboard"
          buttonLabel="Set up Seed Bank"
          onButtonClick={handleClick}
        />
      </Box>

      {/* Seedlings Card */}
      <Box sx={{ mb: 3 }}>
        <SummaryCard
          icon={<SeedlingsIcon sx={{ fontSize: 28 }} />}
          title="Seedlings"
          stats={[
            { label: "Total Seedlings Count", value: "224,416" },
            { label: "Total Withdrawn for Planting", value: "3,436,051", hasLink: true },
          ]}
          linkText="View Planting Progress"
          buttonLabel="Add Inventory"
          onButtonClick={handleClick}
        />
      </Box>

      {/* Mobile App Banner */}
      <Box
        sx={{
          backgroundColor: CARD_BG,
          borderRadius: "12px",
          border: `1px solid ${BORDER_COLOR}`,
          p: 2.5,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Phone icon */}
        <Box
          sx={{
            backgroundColor: ICON_BG,
            borderRadius: "8px",
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PhoneIcon sx={{ color: TEXT_SECONDARY, fontSize: 24 }} />
        </Box>

        {/* Text content */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 600,
              color: TEXT_PRIMARY,
              mb: 0.5,
            }}
          >
            Download the Terraware Mobile App
          </Typography>
          <Typography sx={{ fontSize: "13px", color: TEXT_SECONDARY }}>
            Get the mobile app to take advantage of Seed Collection, Nursery
            Management, and Plant Monitoring features you can use with more
            flexibility beyond your desktop!
          </Typography>
        </Box>

        {/* Download buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            label="Download for Android"
            onClick={handleClick}
            type="productive"
            priority="secondary"
          />
          <Button
            label="Download for iOS"
            onClick={handleClick}
            type="productive"
            priority="secondary"
          />
        </Box>
      </Box>

      {/* Accelerator Footer Banner */}
      <Box
        sx={{
          backgroundColor: CARD_BG,
          borderRadius: "12px",
          border: `1px solid ${BORDER_COLOR}`,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: "13px", color: TEXT_PRIMARY }}>
          Find out more about Terraformation's Seed to Carbon Forest Accelerator{" "}
          <Link to="#">here</Link> and apply!
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            label="Dismiss"
            onClick={handleClick}
            type="productive"
            priority="secondary"
            size="small"
          />
          <Button
            label="Apply"
            onClick={handleClick}
            type="productive"
            priority="secondary"
            size="small"
          />
        </Box>
      </Box>
    </Box>
  );
}
