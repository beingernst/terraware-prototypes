/**
 * Planting Seasons screen.
 * Create and manage planting seasons with targets per stratum/species.
 */

import { useState, useMemo, type Dispatch, type SetStateAction } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Autocomplete,
  Box,
  Chip,
  Collapse,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,

  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,

  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ImageOutlined as ImageOutlinedIcon,
  InfoOutlined as InfoOutlinedIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Button, DialogBox } from '@terraware/web-components';
import { SIDEBAR_WIDTH } from '@/components/navigation/Sidebar';
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { plantingSites, nurseryPlanningSeasons, nurseries } from './nurseryPlanningData';

// Colors
const HEADER_BG = '#F5F5F0';
const TEXT_PRIMARY = '#3A4445';
const TEXT_SECONDARY = '#6B7165';
const BORDER_COLOR = '#E8E5E0';
const PRIMARY_GREEN = '#4A7C59';
const COLOR_GAP = '#F44336';
const COLOR_FULFILLED = '#4CAF50';
const COLOR_PARTIAL = '#FF9800';

function getWithdrawnColor(withdrawn: number, target: number): string {
  if (target === 0) return TEXT_PRIMARY;
  const pct = withdrawn / target;
  if (pct >= 0.8) return COLOR_FULFILLED;
  if (pct >= 0.41) return COLOR_PARTIAL;
  if (pct <= 0.2) return COLOR_GAP;
  return TEXT_PRIMARY;
}

function getRemainingPlantedColor(remaining: number, target: number): string {
  if (target === 0) return TEXT_PRIMARY;
  const pct = remaining / target;
  if (pct <= 0.2) return COLOR_FULFILLED;
  if (pct >= 0.41 && pct <= 0.79) return COLOR_PARTIAL;
  if (pct >= 0.8) return COLOR_GAP;
  return TEXT_PRIMARY;
}

// --- Mock data ---

const strata = [
  { id: 'pst1', name: 'Black-White', siteId: 'ps1' },
  { id: 'pst2', name: 'Stratum 2',   siteId: 'ps1' },
];

const substrata = [
  { id: 'st1', name: 'Black-White-East', stratumId: 'pst1', siteId: 'ps1' },
  { id: 'st2', name: 'Black-White-West', stratumId: 'pst1', siteId: 'ps1' },
  { id: 'st3', name: 'Substrata A',      stratumId: 'pst2', siteId: 'ps1' },
  { id: 'st4', name: 'Substrata B',      stratumId: 'pst2', siteId: 'ps1' },
];

const speciesList = [
  { id: 'sp1',  scientificName: 'Dodonaea viscosa',          commonName: "A'ali'i" },
  { id: 'sp2',  scientificName: 'Acacia koa',                commonName: 'Koa' },
  { id: 'sp3',  scientificName: 'Metrosideros polymorpha',   commonName: "'Ohi'a Lehua" },
  { id: 'sp4',  scientificName: 'Sophora chrysophylla',      commonName: 'Mamane' },
  { id: 'sp5',  scientificName: 'Myoporum sandwicense',      commonName: 'Naio' },
  { id: 'sp6',  scientificName: 'Chenopodium oahuense',      commonName: "'Aweoweo" },
  { id: 'sp7',  scientificName: 'Heteropogon contortus',     commonName: 'Pili' },
  { id: 'sp8',  scientificName: 'Erythrina sandwicensis',    commonName: 'Wiliwili' },
  { id: 'sp9',  scientificName: 'Sida fallax',               commonName: "'Ilima" },
  { id: 'sp10', scientificName: 'Gossypium tomentosum',      commonName: "Ma'o" },
  { id: 'sp11', scientificName: 'Hibiscus brackenridgei',    commonName: "Ma'o hau hele" },
  { id: 'sp12', scientificName: 'Santalum paniculatum',      commonName: "'Iliahi" },
  { id: 'sp13', scientificName: 'Nothocestrum latifolium',   commonName: "'A'iea" },
  { id: 'sp14', scientificName: 'Diospyros sandwicensis',    commonName: 'Lama' },
  { id: 'sp15', scientificName: 'Pittosporum hawaiiense',    commonName: "Ho'awa" },
  { id: 'sp16', scientificName: 'Bobea elatior',             commonName: "'Ahakea" },
  { id: 'sp17', scientificName: 'Chamaesyce celastroides',   commonName: "'Akoko" },
  { id: 'sp18', scientificName: 'Artemisia australis',       commonName: "'A'ina" },
  { id: 'sp19', scientificName: 'Colubrina oppositifolia',   commonName: 'Kauila' },
  { id: 'sp20', scientificName: 'Pleomele auwahiensis',      commonName: 'Hala pepe' },
];

// --- Types ---

interface Season {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  forceActive?: boolean;
  totalTargets?: number;
  totalPlanted?: number;
  strataIds?: string[];
  siteId?: string;
}

interface StratumTarget {
  speciesId: string;
  stratumId: string;
  target: number;
  readyToPlant: number;
  withdrawn: number;
}

interface PlantingWithdrawal {
  id: string;
  date: string;
  substratumId: string;
  speciesId: string;
  quantity: number;
  nurseryName: string;
  plantingSiteName: string;
  plantingSeasonId: string;
  purpose: string;
}

const mockWithdrawals: PlantingWithdrawal[] = [
  { id: 'w1',  date: '2026-03-02', substratumId: 'st1', speciesId: 'sp1',  quantity: 120, nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w2',  date: '2026-03-05', substratumId: 'st1', speciesId: 'sp2',  quantity: 85,  nurseryName: 'Kona',    plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s2', purpose: 'Planting' },
  { id: 'w3',  date: '2026-03-10', substratumId: 'st2', speciesId: 'sp3',  quantity: 200, nurseryName: 'Hilo',    plantingSiteName: 'Ocean View Lands', plantingSeasonId: 'ps3-s2', purpose: 'Planting' },
  { id: 'w4',  date: '2026-03-12', substratumId: 'st1', speciesId: 'sp4',  quantity: 60,  nurseryName: 'Waimea',  plantingSiteName: 'Lapakahi',         plantingSeasonId: 'ps4-s1', purpose: 'Planting' },
  { id: 'w5',  date: '2026-03-15', substratumId: 'st3', speciesId: 'sp5',  quantity: 150, nurseryName: 'Kona',    plantingSiteName: 'Kahua Ranch',      plantingSeasonId: 'ps5-s1', purpose: 'Planting' },
  { id: 'w6',  date: '2026-03-18', substratumId: 'st2', speciesId: 'sp6',  quantity: 90,  nurseryName: 'Hilo',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w7',  date: '2026-03-20', substratumId: 'st1', speciesId: 'sp7',  quantity: 110, nurseryName: 'Waimea',  plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s2', purpose: 'Planting' },
  { id: 'w8',  date: '2026-03-22', substratumId: 'st4', speciesId: 'sp8',  quantity: 75,  nurseryName: 'Kona',    plantingSiteName: 'Ocean View Lands', plantingSeasonId: 'ps3-s2', purpose: 'Planting' },
  { id: 'w9',  date: '2026-03-25', substratumId: 'st3', speciesId: 'sp2',  quantity: 130, nurseryName: 'Hilo',    plantingSiteName: 'Lapakahi',         plantingSeasonId: 'ps4-s1', purpose: 'Planting' },
  { id: 'w10', date: '2026-03-28', substratumId: 'st1', speciesId: 'sp9',  quantity: 95,  nurseryName: 'Waimea',  plantingSiteName: 'Kahua Ranch',      plantingSeasonId: 'ps5-s1', purpose: 'Planting' },
  { id: 'w11', date: '2026-04-01', substratumId: 'st2', speciesId: 'sp10', quantity: 180, nurseryName: 'Kona',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w12', date: '2026-04-03', substratumId: 'st4', speciesId: 'sp1',  quantity: 55,  nurseryName: 'Hilo',    plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s2', purpose: 'Planting' },
  { id: 'w13', date: '2026-04-05', substratumId: 'st1', speciesId: 'sp3',  quantity: 140, nurseryName: 'Waimea',  plantingSiteName: 'Ocean View Lands', plantingSeasonId: 'ps3-s2', purpose: 'Planting' },
  { id: 'w14', date: '2026-04-08', substratumId: 'st3', speciesId: 'sp11', quantity: 70,  nurseryName: 'Kona',    plantingSiteName: 'Lapakahi',         plantingSeasonId: 'ps4-s1', purpose: 'Planting' },
  { id: 'w15', date: '2026-04-10', substratumId: 'st2', speciesId: 'sp12', quantity: 100, nurseryName: 'Hilo',    plantingSiteName: 'Kahua Ranch',      plantingSeasonId: 'ps5-s1', purpose: 'Planting' },
  { id: 'w16', date: '2026-04-12', substratumId: 'st1', speciesId: 'sp5',  quantity: 160, nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w17', date: '2026-04-15', substratumId: 'st4', speciesId: 'sp13', quantity: 45,  nurseryName: 'Kona',    plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s2', purpose: 'Planting' },
  { id: 'w18', date: '2026-04-18', substratumId: 'st3', speciesId: 'sp4',  quantity: 115, nurseryName: 'Hilo',    plantingSiteName: 'Ocean View Lands', plantingSeasonId: 'ps3-s2', purpose: 'Planting' },
  { id: 'w19', date: '2026-04-20', substratumId: 'st2', speciesId: 'sp14', quantity: 80,  nurseryName: 'Waimea',  plantingSiteName: 'Lapakahi',         plantingSeasonId: 'ps4-s1', purpose: 'Planting' },
  { id: 'w20', date: '2026-04-22', substratumId: 'st1', speciesId: 'sp6',  quantity: 135, nurseryName: 'Kona',    plantingSiteName: 'Kahua Ranch',      plantingSeasonId: 'ps5-s1', purpose: 'Planting' },
  { id: 'w21', date: '2026-04-25', substratumId: 'st2', speciesId: 'sp7',  quantity: 65,  nurseryName: 'Hilo',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s3', purpose: 'Planting' },
  { id: 'w22', date: '2026-04-28', substratumId: 'st3', speciesId: 'sp15', quantity: 90,  nurseryName: 'Waimea',  plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s3', purpose: 'Planting' },
  { id: 'w23', date: '2026-05-01', substratumId: 'st1', speciesId: 'sp8',  quantity: 105, nurseryName: 'Kona',    plantingSiteName: 'Ocean View Lands', plantingSeasonId: 'ps3-s2', purpose: 'Planting' },
  { id: 'w24', date: '2026-05-04', substratumId: 'st2', speciesId: 'sp9',  quantity: 175, nurseryName: 'Hilo',    plantingSiteName: 'Lapakahi',         plantingSeasonId: 'ps4-s2', purpose: 'Planting' },
  { id: 'w25', date: '2026-05-07', substratumId: 'st4', speciesId: 'sp16', quantity: 50,  nurseryName: 'Waimea',  plantingSiteName: 'Kahua Ranch',      plantingSeasonId: 'ps5-s1', purpose: 'Planting' },
  // ps1-s2 (Season 2026, Pu'u Wa'awa'a) — one record per species/substratum combination
  { id: 'w26', date: '2026-03-04', substratumId: 'st1', speciesId: 'sp2',  quantity: 85,  nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w27', date: '2026-03-08', substratumId: 'st1', speciesId: 'sp3',  quantity: 110, nurseryName: 'Kona',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w28', date: '2026-03-11', substratumId: 'st1', speciesId: 'sp4',  quantity: 70,  nurseryName: 'Hilo',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w29', date: '2026-03-14', substratumId: 'st2', speciesId: 'sp7',  quantity: 110, nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w30', date: '2026-03-17', substratumId: 'st2', speciesId: 'sp8',  quantity: 75,  nurseryName: 'Kona',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w31', date: '2026-03-19', substratumId: 'st2', speciesId: 'sp9',  quantity: 95,  nurseryName: 'Hilo',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w32', date: '2026-03-23', substratumId: 'st3', speciesId: 'sp11', quantity: 70,  nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w33', date: '2026-03-26', substratumId: 'st3', speciesId: 'sp12', quantity: 100, nurseryName: 'Kona',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w34', date: '2026-03-30', substratumId: 'st3', speciesId: 'sp13', quantity: 45,  nurseryName: 'Hilo',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w35', date: '2026-04-02', substratumId: 'st3', speciesId: 'sp14', quantity: 80,  nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w36', date: '2026-04-06', substratumId: 'st3', speciesId: 'sp15', quantity: 90,  nurseryName: 'Kona',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w37', date: '2026-04-09', substratumId: 'st4', speciesId: 'sp16', quantity: 50,  nurseryName: 'Hilo',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w38', date: '2026-04-13', substratumId: 'st4', speciesId: 'sp17', quantity: 65,  nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w39', date: '2026-04-16', substratumId: 'st4', speciesId: 'sp18', quantity: 55,  nurseryName: 'Kona',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w40', date: '2026-04-19', substratumId: 'st4', speciesId: 'sp19', quantity: 80,  nurseryName: 'Hilo',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w41', date: '2026-04-23', substratumId: 'st4', speciesId: 'sp20', quantity: 75,  nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  // Cross-substratum species in ps1-s2: sp1 and sp2 also planted in Black-White-West
  { id: 'w42', date: '2026-03-16', substratumId: 'st2', speciesId: 'sp1',  quantity: 40,  nurseryName: 'Kona',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w43', date: '2026-03-21', substratumId: 'st2', speciesId: 'sp2',  quantity: 30,  nurseryName: 'Hilo',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  // Multi-date species in ps1-s2 to demonstrate the dates toggle
  { id: 'w44', date: '2026-05-05', substratumId: 'st1', speciesId: 'sp1',  quantity: 35,  nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w45', date: '2026-05-10', substratumId: 'st1', speciesId: 'sp5',  quantity: 40,  nurseryName: 'Kona',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w46', date: '2026-04-20', substratumId: 'st2', speciesId: 'sp7',  quantity: 45,  nurseryName: 'Hilo',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w47', date: '2026-05-15', substratumId: 'st2', speciesId: 'sp7',  quantity: 25,  nurseryName: 'Waimea',  plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  { id: 'w48', date: '2026-04-28', substratumId: 'st3', speciesId: 'sp11', quantity: 25,  nurseryName: 'Kona',    plantingSiteName: "Pu'u Wa'awa'a",   plantingSeasonId: 'ps1-s2', purpose: 'Planting' },
  // Multi-date species in ps2-s2 (Mauna Meadows Season 2026)
  { id: 'w49', date: '2026-11-15', substratumId: 'st1', speciesId: 'sp2',  quantity: 55,  nurseryName: 'Waimea',  plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s2', purpose: 'Planting' },
  { id: 'w50', date: '2026-12-10', substratumId: 'st1', speciesId: 'sp2',  quantity: 30,  nurseryName: 'Kona',    plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s2', purpose: 'Planting' },
  { id: 'w51', date: '2026-11-20', substratumId: 'st2', speciesId: 'sp6',  quantity: 50,  nurseryName: 'Hilo',    plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s2', purpose: 'Planting' },
  { id: 'w52', date: '2026-12-18', substratumId: 'st2', speciesId: 'sp6',  quantity: 40,  nurseryName: 'Waimea',  plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s2', purpose: 'Planting' },
  { id: 'w53', date: '2027-01-08', substratumId: 'st2', speciesId: 'sp6',  quantity: 25,  nurseryName: 'Kona',    plantingSiteName: 'Mauna Meadows',    plantingSeasonId: 'ps2-s2', purpose: 'Planting' },
  // Multi-date species in ps4-s1 (Lapakahi Season 2026)
  { id: 'w54', date: '2026-05-02', substratumId: 'st1', speciesId: 'sp4',  quantity: 60,  nurseryName: 'Waimea',  plantingSiteName: 'Lapakahi',         plantingSeasonId: 'ps4-s1', purpose: 'Planting' },
  { id: 'w55', date: '2026-06-14', substratumId: 'st1', speciesId: 'sp4',  quantity: 25,  nurseryName: 'Hilo',    plantingSiteName: 'Lapakahi',         plantingSeasonId: 'ps4-s1', purpose: 'Planting' },
  { id: 'w56', date: '2026-05-19', substratumId: 'st3', speciesId: 'sp11', quantity: 40,  nurseryName: 'Kona',    plantingSiteName: 'Lapakahi',         plantingSeasonId: 'ps4-s1', purpose: 'Planting' },
  { id: 'w57', date: '2026-06-30', substratumId: 'st3', speciesId: 'sp11', quantity: 30,  nurseryName: 'Waimea',  plantingSiteName: 'Lapakahi',         plantingSeasonId: 'ps4-s1', purpose: 'Planting' },
];

// --- Helpers ---

/**
 * Returns withdrawal log entries for a specific season/substratum/species.
 * If real mock entries exist, returns those. Otherwise synthesizes a single entry
 * so that any non-zero `withdrawn` count always has at least one date to show.
 */
function getWithdrawalEntries(
  seasonId: string,
  substratumId: string,
  speciesId: string,
  withdrawn: number,
): PlantingWithdrawal[] {
  const real = mockWithdrawals.filter(
    (w) => w.plantingSeasonId === seasonId && w.substratumId === substratumId && w.speciesId === speciesId
  );
  if (real.length > 0 || withdrawn === 0) return real;
  const season = nurseryPlanningSeasons.find((s) => s.id === seasonId);
  return [{
    id: `synth-${seasonId}-${substratumId}-${speciesId}`,
    date: season?.startDate ?? '2026-01-01',
    substratumId,
    speciesId,
    quantity: withdrawn,
    nurseryName: 'Waimea Nursery',
    plantingSiteName: season ? (plantingSites.find((s) => s.id === season.siteId)?.name ?? '') : '',
    plantingSeasonId: seasonId,
    purpose: 'Planting',
  }];
}

function formatDate(d: string): string {
  return d
    ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';
}

function formatDateRange(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return '';
  const fmt = (d: string) =>
    d
      ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function isSeasonActive(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false;
  const today = new Date();
  return today >= new Date(startDate + 'T00:00:00') && today <= new Date(endDate + 'T23:59:59');
}

// Default targets: 5 unique species per substratum, used for seasons other than ps1-s2 and ps1-s3
function makeInitialStratumTargets(): StratumTarget[] {
  return [
    // st1 — Black-White-East
    { speciesId: 'sp1',  stratumId: 'st1', target: 200, readyToPlant: 180, withdrawn: 120 },
    { speciesId: 'sp2',  stratumId: 'st1', target: 150, readyToPlant: 130, withdrawn: 85  },
    { speciesId: 'sp3',  stratumId: 'st1', target: 180, readyToPlant: 160, withdrawn: 110 },
    { speciesId: 'sp4',  stratumId: 'st1', target: 120, readyToPlant: 100, withdrawn: 70  },
    { speciesId: 'sp5',  stratumId: 'st1', target: 250, readyToPlant: 220, withdrawn: 160 },
    // st2 — Black-White-West
    { speciesId: 'sp6',  stratumId: 'st2', target: 160, readyToPlant: 140, withdrawn: 90  },
    { speciesId: 'sp7',  stratumId: 'st2', target: 200, readyToPlant: 175, withdrawn: 110 },
    { speciesId: 'sp8',  stratumId: 'st2', target: 140, readyToPlant: 120, withdrawn: 75  },
    { speciesId: 'sp9',  stratumId: 'st2', target: 175, readyToPlant: 150, withdrawn: 95  },
    { speciesId: 'sp10', stratumId: 'st2', target: 220, readyToPlant: 200, withdrawn: 180 },
    // st3 — Substrata A
    { speciesId: 'sp11', stratumId: 'st3', target: 130, readyToPlant: 110, withdrawn: 70  },
    { speciesId: 'sp12', stratumId: 'st3', target: 160, readyToPlant: 140, withdrawn: 100 },
    { speciesId: 'sp13', stratumId: 'st3', target: 100, readyToPlant: 80,  withdrawn: 45  },
    { speciesId: 'sp14', stratumId: 'st3', target: 140, readyToPlant: 120, withdrawn: 80  },
    { speciesId: 'sp15', stratumId: 'st3', target: 150, readyToPlant: 130, withdrawn: 90  },
    // st4 — Substrata B
    { speciesId: 'sp16', stratumId: 'st4', target: 110, readyToPlant: 90,  withdrawn: 50  },
    { speciesId: 'sp17', stratumId: 'st4', target: 130, readyToPlant: 110, withdrawn: 65  },
    { speciesId: 'sp18', stratumId: 'st4', target: 120, readyToPlant: 100, withdrawn: 55  },
    { speciesId: 'sp19', stratumId: 'st4', target: 145, readyToPlant: 125, withdrawn: 80  },
    { speciesId: 'sp20', stratumId: 'st4', target: 160, readyToPlant: 140, withdrawn: 75  },
  ];
}

// ps1-s2 (Season 2026, Pu'u Wa'awa'a): 20 unique species, with sp1/sp2/sp3 each planted across multiple substrata.
// readyToPlant is stored on the first entry per species only (0 on duplicates) so season-level allocation
// totals correctly when summed across substratum entries.
function makeStratumTargets_ps1_s2(): StratumTarget[] {
  return [
    // st1 — Black-White-East
    { speciesId: 'sp1',  stratumId: 'st1', target: 200, readyToPlant: 240, withdrawn: 155 }, // sp1 also in st2; w1(120)+w44(35)
    { speciesId: 'sp2',  stratumId: 'st1', target: 150, readyToPlant: 230, withdrawn: 85  }, // sp2 also in st2 + st3
    { speciesId: 'sp3',  stratumId: 'st1', target: 180, readyToPlant: 250, withdrawn: 110 }, // sp3 also in st3
    { speciesId: 'sp4',  stratumId: 'st1', target: 120, readyToPlant: 100, withdrawn: 70  },
    { speciesId: 'sp5',  stratumId: 'st1', target: 250, readyToPlant: 220, withdrawn: 200 }, // w16(160)+w45(40)
    // st2 — Black-White-West
    { speciesId: 'sp1',  stratumId: 'st2', target:  80, readyToPlant:   0, withdrawn:  40 }, // sp1 also in st1
    { speciesId: 'sp2',  stratumId: 'st2', target:  60, readyToPlant:   0, withdrawn:  30 }, // sp2 also in st1 + st3
    { speciesId: 'sp6',  stratumId: 'st2', target: 160, readyToPlant: 140, withdrawn: 90  },
    { speciesId: 'sp7',  stratumId: 'st2', target: 200, readyToPlant: 175, withdrawn: 180 }, // w29(110)+w46(45)+w47(25)
    { speciesId: 'sp8',  stratumId: 'st2', target: 140, readyToPlant: 120, withdrawn: 75  },
    { speciesId: 'sp9',  stratumId: 'st2', target: 175, readyToPlant: 150, withdrawn: 95  },
    { speciesId: 'sp10', stratumId: 'st2', target: 220, readyToPlant: 200, withdrawn: 180 },
    // st3 — Substrata A
    { speciesId: 'sp2',  stratumId: 'st3', target:  40, readyToPlant:   0, withdrawn:   0 }, // sp2 also in st1 + st2
    { speciesId: 'sp3',  stratumId: 'st3', target:  90, readyToPlant:   0, withdrawn:   0 }, // sp3 also in st1
    { speciesId: 'sp11', stratumId: 'st3', target: 130, readyToPlant: 110, withdrawn: 95  }, // w32(70)+w48(25)
    { speciesId: 'sp12', stratumId: 'st3', target: 160, readyToPlant: 140, withdrawn: 100 },
    { speciesId: 'sp13', stratumId: 'st3', target: 100, readyToPlant: 80,  withdrawn: 45  },
    { speciesId: 'sp14', stratumId: 'st3', target: 140, readyToPlant: 120, withdrawn: 80  },
    { speciesId: 'sp15', stratumId: 'st3', target: 150, readyToPlant: 130, withdrawn: 90  },
    // st4 — Substrata B
    { speciesId: 'sp16', stratumId: 'st4', target: 110, readyToPlant: 90,  withdrawn: 50  },
    { speciesId: 'sp17', stratumId: 'st4', target: 130, readyToPlant: 110, withdrawn: 65  },
    { speciesId: 'sp18', stratumId: 'st4', target: 120, readyToPlant: 100, withdrawn: 55  },
    { speciesId: 'sp19', stratumId: 'st4', target: 145, readyToPlant: 125, withdrawn: 80  },
    { speciesId: 'sp20', stratumId: 'st4', target: 160, readyToPlant: 140, withdrawn: 75  },
  ];
}

// ps1-s3 (Season 2027, Pu'u Wa'awa'a): exactly 15 unique species, each in only one substratum.
// Future season so withdrawn = 0 throughout.
function makeStratumTargets_ps1_s3(): StratumTarget[] {
  return [
    // st1 — Black-White-East (4 species)
    { speciesId: 'sp1',  stratumId: 'st1', target: 150, readyToPlant: 120, withdrawn: 0 },
    { speciesId: 'sp2',  stratumId: 'st1', target: 100, readyToPlant:  80, withdrawn: 0 },
    { speciesId: 'sp3',  stratumId: 'st1', target: 130, readyToPlant: 110, withdrawn: 0 },
    { speciesId: 'sp4',  stratumId: 'st1', target:  90, readyToPlant:  70, withdrawn: 0 },
    // st2 — Black-White-West (4 species)
    { speciesId: 'sp5',  stratumId: 'st2', target: 200, readyToPlant: 160, withdrawn: 0 },
    { speciesId: 'sp6',  stratumId: 'st2', target: 120, readyToPlant:  90, withdrawn: 0 },
    { speciesId: 'sp7',  stratumId: 'st2', target: 150, readyToPlant: 120, withdrawn: 0 },
    { speciesId: 'sp8',  stratumId: 'st2', target: 110, readyToPlant:  85, withdrawn: 0 },
    // st3 — Substrata A (3 species)
    { speciesId: 'sp9',  stratumId: 'st3', target:  80, readyToPlant:  60, withdrawn: 0 },
    { speciesId: 'sp10', stratumId: 'st3', target: 100, readyToPlant:  75, withdrawn: 0 },
    { speciesId: 'sp11', stratumId: 'st3', target:  90, readyToPlant:  70, withdrawn: 0 },
    // st4 — Substrata B (4 species)
    { speciesId: 'sp12', stratumId: 'st4', target: 120, readyToPlant:  90, withdrawn: 0 },
    { speciesId: 'sp13', stratumId: 'st4', target:  80, readyToPlant:  60, withdrawn: 0 },
    { speciesId: 'sp14', stratumId: 'st4', target: 100, readyToPlant:  75, withdrawn: 0 },
    { speciesId: 'sp15', stratumId: 'st4', target:  90, readyToPlant:  70, withdrawn: 0 },
  ];
}

function makeStratumTargets(seasonId: string): StratumTarget[] {
  if (seasonId === 'ps1-s2') return makeStratumTargets_ps1_s2();
  if (seasonId === 'ps1-s3') return makeStratumTargets_ps1_s3();
  return makeInitialStratumTargets();
}

// --- Withdrawal Details screen ---

type WithdrawalPurpose = 'Planting' | 'Nursery Transfer' | 'Dead' | 'Other';

function getMockBatches(speciesId: string): string[] {
  const n = parseInt(speciesId.replace('sp', ''), 10) || 1;
  const pad = (x: number) => String(x).padStart(3, '0');
  return [
    `24-2-${n}-${pad(44 + (n % 10))}`,
    `25-2-${n + 1}-${pad(20 + (n % 8))}`,
    `25-2-${n + 2}-${pad(3 + (n % 7))}`,
    `25-2-${n}-${pad(4 + (n % 6))}`,
    `25-2-${n + 3}-${pad(19 + (n % 9))}`,
    `24-2-${n + 1}-${pad(44 + ((n + 1) % 10))}`,
  ].slice(0, 4 + (n % 3));
}

interface MockBatch {
  id: string;
  nurseryName: string;
  readyToPlant: number;
}

function getMockBatchData(speciesId: string): MockBatch[] {
  const n = parseInt(speciesId.replace('sp', ''), 10) || 1;
  const pad = (x: number) => String(x).padStart(3, '0');
  const nurseryNames = ['Waimea Nursery', 'Kona Nursery', 'Hilo Nursery'];
  const qtys = [5, 50, 50, 140, 50, 4];
  return [
    { id: `26-2-${n}-${pad(4  + (n % 10))}`, nurseryName: nurseryNames[n % 3],       readyToPlant: qtys[0] },
    { id: `25-2-${n}-${pad(26 + (n % 8))}`,  nurseryName: nurseryNames[n % 3],       readyToPlant: qtys[1] },
    { id: `25-2-${n}-${pad(25 + (n % 7))}`,  nurseryName: nurseryNames[n % 3],       readyToPlant: qtys[2] },
    { id: `25-2-${n}-${pad(24 + (n % 6))}`,  nurseryName: nurseryNames[(n+1) % 3],   readyToPlant: qtys[3] },
    { id: `25-2-${n}-${pad(23 + (n % 9))}`,  nurseryName: nurseryNames[(n+1) % 3],   readyToPlant: qtys[4] },
    { id: `23-2-${n}-${pad(9  + (n % 5))}`,  nurseryName: nurseryNames[(n+2) % 3],   readyToPlant: qtys[5] },
  ];
}

const headCell = { fontWeight: 600, color: TEXT_PRIMARY, borderBottom: `1px solid ${BORDER_COLOR}`, fontSize: '0.75rem' } as const;

function WithdrawalDetailsScreen({
  speciesId,
  species,
  onCancel,
  onNext,
  initialSiteId,
  initialSeasonId,
  initialStratumId,
  initialSubstratumId,
}: {
  speciesId: string;
  species: { scientificName: string; commonName: string } | null;
  onCancel: () => void;
  onNext: () => void;
  initialSiteId?: string;
  initialSeasonId?: string;
  initialStratumId?: string;
  initialSubstratumId?: string;
}) {
  const [purpose, setPurpose] = useState<WithdrawalPurpose>('Planting');
  const [fromNursery, setFromNursery] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState(initialSiteId ?? '');
  const [selectedSeasonId, setSelectedSeasonId] = useState(initialSeasonId ?? '');
  const [selectedStratumId, setSelectedStratumId] = useState(initialStratumId ?? '');
  const [selectedSubstratumId, setSelectedSubstratumId] = useState(initialSubstratumId ?? '');
  const [withdrawDate, setWithdrawDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const seasonsForSite    = nurseryPlanningSeasons.filter((s) => s.siteId === selectedSiteId);
  const strataForSite     = strata.filter((s) => s.siteId === selectedSiteId);
  const substrataForStrat = substrata.filter((s) => s.stratumId === selectedStratumId);

  const handleSiteChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    setSelectedSeasonId('');
    setSelectedStratumId('');
    setSelectedSubstratumId('');
  };

  const handleStratumChange = (stratumId: string) => {
    setSelectedStratumId(stratumId);
    setSelectedSubstratumId('');
  };

  const batches = getMockBatches(speciesId);

  return (
    <Box sx={{ bgcolor: '#F0EFEB', minHeight: '100%', pb: 12 }}>
      <Box sx={{ maxWidth: 640, mx: 'auto', pt: 5, px: 2 }}>
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Title */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 0.5 }}>
              Withdrawal Details
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
              Select a withdrawal purpose and enter the quantities from each batch to withdraw.
            </Typography>
          </Box>

          {/* Batches Selected */}
          <Box>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>
              Batches Selected
            </Typography>
            <Typography variant="body2" sx={{ color: TEXT_PRIMARY, mt: 0.25 }}>
              {batches.join(', ')}
            </Typography>
          </Box>

          {/* Species Selected */}
          <Box>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>
              Species Selected
            </Typography>
            <Typography variant="body1" sx={{ color: TEXT_PRIMARY, fontWeight: 600, fontStyle: 'italic', mt: 0.25 }}>
              {species?.scientificName} ({species?.commonName})
            </Typography>
          </Box>

          {/* Purpose */}
          <FormControl>
            <FormLabel sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 500, mb: 0.5, '&.Mui-focused': { color: TEXT_SECONDARY } }}>
              Purpose *
            </FormLabel>
            <RadioGroup value={purpose} onChange={(e) => setPurpose(e.target.value as WithdrawalPurpose)}>
              {(['Planting', 'Nursery Transfer', 'Dead', 'Other'] as WithdrawalPurpose[]).map((p) => (
                <FormControlLabel
                  key={p}
                  value={p}
                  control={<Radio size="small" sx={{ color: TEXT_SECONDARY, '&.Mui-checked': { color: PRIMARY_GREEN } }} />}
                  label={<Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>{p}</Typography>}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* From: Nursery */}
          <Box>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500, display: 'block', mb: 0.75 }}>
              From: Nursery *
            </Typography>
            <Select
              displayEmpty
              value={fromNursery}
              onChange={(e) => setFromNursery(e.target.value)}
              fullWidth
              size="small"
              renderValue={(v) => v || <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.875rem' }}>Select...</Typography>}
            >
              {nurseries.map((n) => (
                <MenuItem key={n.id} value={n.name}>{n.name}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Filter by Project */}
          <Box>
            <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500, display: 'block', mb: 0.75 }}>
              Filter by Project
            </Typography>
            <Select displayEmpty value="" fullWidth size="small" renderValue={() => ''}>
              <MenuItem value="" />
            </Select>
          </Box>

          {/* Divider */}
          <Box sx={{ borderTop: `1px solid ${BORDER_COLOR}` }} />

          {purpose === 'Planting' && (
            <>
              {/* To: Planting Site */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                  <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>
                    To: Planting Site *
                  </Typography>
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: TEXT_SECONDARY }} />
                </Box>
                <Select
                  displayEmpty
                  value={selectedSiteId}
                  onChange={(e) => handleSiteChange(e.target.value)}
                  fullWidth
                  size="small"
                  renderValue={(v) => {
                    const site = plantingSites.find((s) => s.id === v);
                    return site ? site.name : <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.875rem' }}>Select...</Typography>;
                  }}
                >
                  {plantingSites.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Planting Season */}
              <Box>
                <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500, display: 'block', mb: 0.75 }}>
                  Planting Season *
                </Typography>
                <Select
                  displayEmpty
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!selectedSiteId}
                  renderValue={(v) => {
                    const season = seasonsForSite.find((s) => s.id === v);
                    return season ? season.name : <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.875rem' }}>{selectedSiteId ? 'Select...' : 'Select a site first'}</Typography>;
                  }}
                >
                  {seasonsForSite.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </Box>

              {/* To: Stratum */}
              <Box>
                <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500, display: 'block', mb: 0.75 }}>
                  To: Stratum *
                </Typography>
                <Select
                  displayEmpty
                  value={selectedStratumId}
                  onChange={(e) => handleStratumChange(e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!selectedSiteId}
                  renderValue={(v) => {
                    const stratum = strataForSite.find((s) => s.id === v);
                    return stratum ? stratum.name : <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.875rem' }}>{selectedSiteId ? 'Select...' : 'Select a site first'}</Typography>;
                  }}
                >
                  {strataForSite.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </Box>

              {/* To: Substratum */}
              <Box>
                <Typography variant="caption" sx={{ color: TEXT_SECONDARY, fontWeight: 500, display: 'block', mb: 0.75 }}>
                  To: Substratum *
                </Typography>
                <Select
                  displayEmpty
                  value={selectedSubstratumId}
                  onChange={(e) => setSelectedSubstratumId(e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!selectedStratumId}
                  renderValue={(v) => {
                    const sub = substrataForStrat.find((s) => s.id === v);
                    return sub ? sub.name : <Typography sx={{ color: TEXT_SECONDARY, fontSize: '0.875rem' }}>{selectedStratumId ? 'Select...' : 'Select a stratum first'}</Typography>;
                  }}
                >
                  {substrataForStrat.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                  ))}
                </Select>
              </Box>
            </>
          )}

          {/* Withdraw Date */}
          <TextField
            label="Withdraw Date *"
            type="date"
            value={withdrawDate}
            onChange={(e) => setWithdrawDate(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {/* Notes */}
          <TextField
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </Box>
      </Box>

      {/* Fixed bottom bar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: SIDEBAR_WIDTH,
          right: 0,
          bgcolor: '#fff',
          borderTop: `1px solid ${BORDER_COLOR}`,
          px: 4,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 100,
        }}
      >
        <Button label="Cancel" onClick={onCancel} priority="secondary" />
        <Button label="Next" onClick={onNext} />
      </Box>
    </Box>
  );
}

// --- Withdraw from Batches step ---

function WithdrawFromBatchesScreen({
  speciesId,
  species,
  onCancel,
  onNext,
}: {
  speciesId: string;
  species: { scientificName: string; commonName: string } | null;
  onCancel: () => void;
  onNext: (totalQuantity: number) => void;
}) {
  const batches = getMockBatchData(speciesId);
  const [batchQtys, setBatchQtys] = useState<Record<string, string>>(
    () => Object.fromEntries(batches.map((b) => [b.id, '0']))
  );
  const totalWithdraw = batches.reduce((sum, b) => {
    const n = parseInt(batchQtys[b.id] ?? '0', 10);
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  return (
    <Box sx={{ bgcolor: '#F0EFEB', minHeight: '100%', pb: 12 }}>
      <Box sx={{ pt: 4, px: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
          Withdraw from Batches
        </Typography>
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${BORDER_COLOR}` }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>
              Select Batches
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: TEXT_SECONDARY, mt: 0.25 }}>
              {species?.scientificName} ({species?.commonName})
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: HEADER_BG }}>
                <TableCell sx={headCell}>Seedling Batch</TableCell>
                <TableCell sx={headCell}>Nursery</TableCell>
                <TableCell sx={headCell}>Project</TableCell>
                <TableCell align="right" sx={headCell}>Ready To Plant Quantity</TableCell>
                <TableCell align="right" sx={headCell}>Withdraw</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches.map((batch, i) => (
                <TableRow key={batch.id} sx={{ bgcolor: i % 2 === 0 ? '#F9F9F7' : '#fff' }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: PRIMARY_GREEN, fontWeight: 500 }}>
                      {batch.id}
                    </Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{batch.nurseryName}</Typography></TableCell>
                  <TableCell />
                  <TableCell align="right">
                    <Typography variant="body2">{batch.readyToPlant}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      value={batchQtys[batch.id] ?? '0'}
                      onChange={(e) => setBatchQtys((prev) => ({ ...prev, [batch.id]: e.target.value }))}
                      slotProps={{ htmlInput: { style: { textAlign: 'right' }, min: 0, max: batch.readyToPlant } }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
      <Box sx={{ position: 'fixed', bottom: 0, left: SIDEBAR_WIDTH, right: 0, bgcolor: '#fff', borderTop: `1px solid ${BORDER_COLOR}`, px: 4, py: 2, display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <Button label="Cancel" onClick={onCancel} priority="secondary" />
        <Button label="Next" onClick={() => onNext(totalWithdraw)} />
      </Box>
    </Box>
  );
}

// --- Add Photos step ---

function AddPhotosScreen({
  onCancel,
  onWithdraw,
}: {
  onCancel: () => void;
  onWithdraw: () => void;
}) {
  return (
    <Box sx={{ bgcolor: '#F0EFEB', minHeight: '100%', pb: 12 }}>
      <Box sx={{ pt: 4, px: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 3 }}>
          Withdraw from Batches
        </Typography>
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, p: 3, maxWidth: 480 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: TEXT_PRIMARY, mb: 0.5 }}>
            Add Photos
          </Typography>
          <Typography variant="body2" sx={{ color: TEXT_SECONDARY, mb: 2 }}>
            Take an optional photo (or photos) of the batches.
          </Typography>
          <Box sx={{
            border: '2px dashed #C8C4BC',
            borderRadius: 2,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#EEECEA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageOutlinedIcon sx={{ fontSize: 28, color: TEXT_SECONDARY }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>Add Photos</Typography>
            <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>Browse or drag and drop a file (JPG, PNG).</Typography>
            <Button label="Add Photo..." priority="secondary" onClick={() => {}} />
          </Box>
        </Box>
      </Box>
      <Box sx={{ position: 'fixed', bottom: 0, left: SIDEBAR_WIDTH, right: 0, bgcolor: '#fff', borderTop: `1px solid ${BORDER_COLOR}`, px: 4, py: 2, display: 'flex', justifyContent: 'space-between', zIndex: 100 }}>
        <Button label="Cancel" onClick={onCancel} priority="secondary" />
        <Button label="Withdraw" onClick={onWithdraw} />
      </Box>
    </Box>
  );
}

// --- View Planting Season sub-screen ---

const SPECIES_LIMIT = 5;

type WithdrawTarget = {
  speciesId: string;
  substratumId: string;
  plantingSiteId: string;
  plantingSeasonId: string;
  stratumId: string;
};

function SubstratumSection({
  substratum,
  season,
  stratumTargets,
  updateTarget,
  deleteSpecies,
  addSpecies,
  addingToStratumId,
  setAddingToStratumId,
  showAllSpecies,
  setShowAllSpecies,
  setWithdrawTarget,
  onNavigateToProgress,
}: {
  substratum: (typeof substrata)[0];
  season: Season;
  stratumTargets: StratumTarget[];
  updateTarget: (speciesId: string, stratumId: string, value: number) => void;
  deleteSpecies: (speciesId: string, stratumId: string) => void;
  addSpecies: (speciesId: string, stratumId: string) => void;
  addingToStratumId: string | null;
  setAddingToStratumId: (id: string | null) => void;
  showAllSpecies: Set<string>;
  setShowAllSpecies: Dispatch<SetStateAction<Set<string>>>;
  setWithdrawTarget: Dispatch<SetStateAction<WithdrawTarget | null>>;
  onNavigateToProgress: (params: { substratumId: string; speciesId?: string; seasonId: string; siteId: string }) => void;
}) {
  const substratumId = substratum.id;
  const spTargets = stratumTargets.filter((t) => t.stratumId === substratumId);
  const subGoal = spTargets.reduce((s, t) => s + t.target, 0);
  const subWithdrawn = spTargets.reduce((s, t) => s + t.withdrawn, 0);

  // Season-level allocation per species (same value shown on all substratum rows for the same species)
  const seasonAllocated = (speciesId: string) =>
    stratumTargets.filter((t) => t.speciesId === speciesId).reduce((sum, t) => sum + t.readyToPlant, 0);

  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const toggleDates = (speciesId: string) =>
    setExpandedDates((prev) => {
      const next = new Set(prev);
      next.has(speciesId) ? next.delete(speciesId) : next.add(speciesId);
      return next;
    });

  const sortedSpTargets = [...spTargets].sort((a, b) => {
    const nameA = speciesList.find((s) => s.id === a.speciesId)?.scientificName ?? '';
    const nameB = speciesList.find((s) => s.id === b.speciesId)?.scientificName ?? '';
    return nameA.localeCompare(nameB);
  });

  const isEmpty = sortedSpTargets.length === 0;
  const showAll = showAllSpecies.has(substratumId);
  const displayedTargets = showAll ? sortedSpTargets : sortedSpTargets.slice(0, SPECIES_LIMIT);
  const hiddenCount = sortedSpTargets.length - SPECIES_LIMIT;

  const addedIds = spTargets.map((t) => t.speciesId);
  const available = speciesList
    .filter((sp) => !addedIds.includes(sp.id))
    .sort((a, b) => a.scientificName.localeCompare(b.scientificName));
  const isAddingHere = addingToStratumId === substratumId;
  const showSelector = isAddingHere || isEmpty;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Substratum sub-header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>
          {substratum.name}
        </Typography>
        <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
          Goal: {subGoal.toLocaleString()} · Planted: {subWithdrawn.toLocaleString()} · Remaining: {(subGoal - subWithdrawn).toLocaleString()}
        </Typography>
      </Box>

      {/* Species table */}
      <Box sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: 1, overflow: 'hidden' }}>
        <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: HEADER_BG }}>
              <TableCell sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '38%' }}>
                Species
              </TableCell>
              <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '15%' }}>
                Planted Goal
              </TableCell>
              <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '20%' }}>
                Planted
              </TableCell>
              <TableCell align="right" sx={{ color: TEXT_SECONDARY, fontSize: '0.75rem', fontWeight: 600, width: '20%' }}>
                Remaining to be Planted
              </TableCell>
              <TableCell sx={{ width: '7%' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedTargets.map((st) => {
              const sp = speciesList.find((s) => s.id === st.speciesId);
              const remaining = st.target - st.withdrawn;
              const withdrawalDates = getWithdrawalEntries(season.id, substratumId, st.speciesId, st.withdrawn)
                .sort((a, b) => b.date.localeCompare(a.date)); // most recent first
              const datesExpanded = expandedDates.has(st.speciesId);
              return (
                <TableRow key={st.speciesId} sx={{ '& td': { borderBottom: `1px solid ${BORDER_COLOR}` } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontStyle: 'italic' }}>
                        {sp?.scientificName} ({sp?.commonName})
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={st.target}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 0) updateTarget(st.speciesId, substratumId, val);
                        }}
                        slotProps={{
                          input: { sx: { fontSize: '0.85rem', py: 0 } },
                          htmlInput: { min: 0, step: 1 },
                        }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            onClick={() => onNavigateToProgress({ substratumId, speciesId: st.speciesId, seasonId: season.id, siteId: season.siteId ?? '' })}
                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                          >
                            <Typography variant="body2" sx={{ color: getWithdrawnColor(st.withdrawn, st.target), fontWeight: 600 }}>
                              {st.withdrawn.toLocaleString()}
                            </Typography>
                            <OpenInNewIcon sx={{ fontSize: 14, color: PRIMARY_GREEN, mb: '2px' }} />
                          </Box>
                          {st.withdrawn > 0 && (
                            <Typography
                              variant="caption"
                              onClick={(e) => { e.stopPropagation(); toggleDates(st.speciesId); }}
                              sx={{ color: TEXT_SECONDARY, cursor: 'pointer', '&:hover': { color: TEXT_PRIMARY } }}
                            >
                              {datesExpanded ? 'dates ↑' : 'dates ↓'}
                            </Typography>
                          )}
                        </Box>
                        {datesExpanded && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25, mt: 0.5 }}>
                            {withdrawalDates.map((w) => {
                              const label = new Date(w.date + 'T00:00:00').toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              });
                              return (
                                <Typography key={w.id} variant="caption" sx={{ color: TEXT_SECONDARY }}>
                                  {label} · {w.quantity.toLocaleString()}
                                </Typography>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: getRemainingPlantedColor(remaining, st.target), fontWeight: 600 }}>
                            {remaining.toLocaleString()}
                          </Typography>
                          {remaining > 0 && (
                            <Typography
                              variant="body2"
                              sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' }, whiteSpace: 'nowrap' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                const sub = substrata.find((s) => s.id === substratumId);
                                setWithdrawTarget({
                                  speciesId: st.speciesId,
                                  substratumId,
                                  plantingSiteId: season.siteId ?? '',
                                  plantingSeasonId: season.id,
                                  stratumId: sub?.stratumId ?? '',
                                });
                              }}
                            >
                              + Withdraw
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
                          {seasonAllocated(st.speciesId).toLocaleString()} alloc.
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ px: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => deleteSpecies(st.speciesId, substratumId)}
                        sx={{ color: TEXT_SECONDARY, '&:hover': { color: COLOR_GAP } }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
              );
            })}

            {showSelector && (
              <TableRow>
                <TableCell colSpan={5} sx={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                  <Autocomplete
                    size="small"
                    options={available}
                    sx={{ maxWidth: 320 }}
                    getOptionLabel={(sp) => `${sp.scientificName} (${sp.commonName})`}
                    onChange={(_, val) => {
                      if (val) addSpecies(val.id, substratumId);
                    }}
                    onBlur={() => {
                      if (!isEmpty) setAddingToStratumId(null);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} autoFocus={isAddingHere} placeholder="Select species..." />
                    )}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
        {!showAll && hiddenCount > 0 && (
          <Typography
            variant="body2"
            sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => setShowAllSpecies((prev) => new Set([...prev, substratumId]))}
          >
            Show {hiddenCount} more
          </Typography>
        )}
        {showAll && sortedSpTargets.length > SPECIES_LIMIT && (
          <Typography
            variant="body2"
            sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() =>
              setShowAllSpecies((prev) => {
                const next = new Set(prev);
                next.delete(substratumId);
                return next;
              })
            }
          >
            Show less
          </Typography>
        )}
        {!isAddingHere && (
          <Typography
            variant="body2"
            sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => setAddingToStratumId(substratumId)}
          >
            + Add Species
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function ViewPlantingSeasonView({
  season,
  onBack,
  stratumTargets,
  onStratumTargetsChange,
  onNavigateToProgress,
  onSeasonUpdate,
}: {
  season: Season;
  onBack: () => void;
  stratumTargets: StratumTarget[];
  onStratumTargetsChange: (targets: StratumTarget[]) => void;
  onNavigateToProgress: (params: { substratumId: string; speciesId?: string; seasonId: string; siteId: string }) => void;
  onSeasonUpdate: (updated: Season) => void;
}) {
  const [addingToStratumId, setAddingToStratumId] = useState<string | null>(null);
  const [showAllSpecies, setShowAllSpecies] = useState<Set<string>>(new Set());
  const [withdrawTarget, setWithdrawTarget] = useState<WithdrawTarget | null>(null);
  type WithdrawalStep = 'details' | 'batches' | 'photos';
  const [withdrawalStep, setWithdrawalStep] = useState<WithdrawalStep>('details');
  const [pendingWithdrawQty, setPendingWithdrawQty] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(season.name);
  const [editingDates, setEditingDates] = useState(false);
  const [draftStart, setDraftStart] = useState(season.startDate);
  const [draftEnd, setDraftEnd] = useState(season.endDate);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const commitName = () => {
    if (draftName.trim()) onSeasonUpdate({ ...season, name: draftName.trim() });
    else setDraftName(season.name);
    setEditingName(false);
  };

  const commitDates = () => {
    onSeasonUpdate({ ...season, startDate: draftStart, endDate: draftEnd });
    setEditingDates(false);
  };

  const updateTarget = (speciesId: string, stratumId: string, value: number) => {
    onStratumTargetsChange(
      stratumTargets.map((t) =>
        t.speciesId === speciesId && t.stratumId === stratumId ? { ...t, target: value } : t
      )
    );
  };

  const deleteSpecies = (speciesId: string, stratumId: string) => {
    onStratumTargetsChange(
      stratumTargets.filter((t) => !(t.speciesId === speciesId && t.stratumId === stratumId))
    );
  };

  const addSpecies = (speciesId: string, stratumId: string) => {
    onStratumTargetsChange([
      ...stratumTargets,
      { speciesId, stratumId, target: 0, readyToPlant: 0, withdrawn: 0 },
    ]);
    setAddingToStratumId(null);
  };

  const speciesSummary = useMemo(() => {
    const map = new Map<string, { target: number; readyToPlant: number; withdrawn: number }>();
    for (const t of stratumTargets) {
      const existing = map.get(t.speciesId) ?? { target: 0, readyToPlant: 0, withdrawn: 0 };
      map.set(t.speciesId, {
        target: existing.target + t.target,
        readyToPlant: existing.readyToPlant + t.readyToPlant,
        withdrawn: existing.withdrawn + t.withdrawn,
      });
    }
    return [...map.entries()]
      .map(([speciesId, totals]) => ({ speciesId, ...totals }))
      .filter((row) => row.target > 0 || row.withdrawn > 0)
      .sort((a, b) => {
        const nameA = speciesList.find((s) => s.id === a.speciesId)?.scientificName ?? '';
        const nameB = speciesList.find((s) => s.id === b.speciesId)?.scientificName ?? '';
        return nameA.localeCompare(nameB);
      });
  }, [stratumTargets]);

  const totalGoal = speciesSummary.reduce((s, r) => s + r.target, 0);
  const totalWithdrawn = speciesSummary.reduce((s, r) => s + r.withdrawn, 0);
  const totalRemaining = totalGoal - totalWithdrawn;
  const siteStrata = strata.filter((s) => s.siteId === (season.siteId ?? 'ps1'));
  // headCell is defined at module scope

  if (withdrawTarget) {
    const sp = speciesList.find((s) => s.id === withdrawTarget.speciesId);
    const handleCancel = () => {
      setWithdrawTarget(null);
      setWithdrawalStep('details');
    };

    const handleWithdraw = () => {
      onStratumTargetsChange(
        stratumTargets.map((t) =>
          t.speciesId === withdrawTarget.speciesId && t.stratumId === withdrawTarget.substratumId
            ? { ...t, withdrawn: t.withdrawn + pendingWithdrawQty }
            : t
        )
      );
      setWithdrawTarget(null);
      setWithdrawalStep('details');
      setPendingWithdrawQty(0);
    };

    if (withdrawalStep === 'details') {
      return (
        <WithdrawalDetailsScreen
          speciesId={withdrawTarget.speciesId}
          species={sp ?? null}
          initialSiteId={withdrawTarget.plantingSiteId}
          initialSeasonId={withdrawTarget.plantingSeasonId}
          initialStratumId={withdrawTarget.stratumId}
          initialSubstratumId={withdrawTarget.substratumId}
          onCancel={handleCancel}
          onNext={() => setWithdrawalStep('batches')}
        />
      );
    }

    if (withdrawalStep === 'batches') {
      return (
        <WithdrawFromBatchesScreen
          speciesId={withdrawTarget.speciesId}
          species={sp ?? null}
          onCancel={handleCancel}
          onNext={(qty) => {
            setPendingWithdrawQty(qty);
            setWithdrawalStep('photos');
          }}
        />
      );
    }

    return (
      <AddPhotosScreen
        onCancel={handleCancel}
        onWithdraw={handleWithdraw}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Back nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
        <IconButton size="small" onClick={onBack} sx={{ color: TEXT_SECONDARY }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="body2"
          sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={onBack}
        >
          Planting Seasons
        </Typography>
      </Box>

      {/* Season header */}
      {editingName ? (
        <TextField
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitName();
            if (e.key === 'Escape') { setDraftName(season.name); setEditingName(false); }
          }}
          autoFocus
          size="small"
          sx={{ mb: 0.5 }}
        />
      ) : (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>
            {season.name}
          </Typography>
          <IconButton size="small" onClick={() => { setDraftName(season.name); setEditingName(true); }} sx={{ color: TEXT_SECONDARY, p: '2px' }}>
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
        {editingDates ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              type="date"
              value={draftStart}
              onChange={(e) => setDraftStart(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 155 }}
            />
            <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>–</Typography>
            <TextField
              type="date"
              value={draftEnd}
              onChange={(e) => setDraftEnd(e.target.value)}
              onBlur={commitDates}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitDates();
                if (e.key === 'Escape') { setDraftStart(season.startDate); setDraftEnd(season.endDate); setEditingDates(false); }
              }}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ width: 155 }}
            />
          </Box>
        ) : (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            {season.startDate && season.endDate && (
              <Typography variant="body2" sx={{ color: TEXT_SECONDARY }}>
                {formatDateRange(season.startDate, season.endDate)}
              </Typography>
            )}
            <IconButton size="small" onClick={() => { setDraftStart(season.startDate); setDraftEnd(season.endDate); setEditingDates(true); }} sx={{ color: TEXT_SECONDARY, p: '2px' }}>
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Compact stats chips */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: summaryOpen ? 1 : 3, flexWrap: 'wrap' }}>
        <Chip label={`${speciesSummary.length} species`} size="small" variant="outlined" sx={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR }} />
        <Chip label={`Goal: ${totalGoal.toLocaleString()}`} size="small" variant="outlined" sx={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR }} />
        <Chip label={`Withdrawn for Planting: ${totalWithdrawn.toLocaleString()}`} size="small" variant="outlined" sx={{ color: totalWithdrawn > 0 ? COLOR_FULFILLED : TEXT_SECONDARY, borderColor: BORDER_COLOR }} />
        <Chip label={`Remaining: ${totalRemaining.toLocaleString()}`} size="small" variant="outlined" sx={{ color: totalRemaining > 0 ? COLOR_PARTIAL : COLOR_FULFILLED, borderColor: BORDER_COLOR }} />
        <IconButton size="small" onClick={() => setSummaryOpen((v) => !v)} sx={{ color: TEXT_SECONDARY, ml: 0.5 }}>
          {summaryOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Expandable species summary table */}
      <Collapse in={summaryOpen}>
        <Box sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: 1, mb: 3, overflow: 'hidden' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: HEADER_BG }}>
                <TableCell sx={headCell}>Species</TableCell>
                <TableCell align="right" sx={headCell}>Planted Goal</TableCell>
                <TableCell align="right" sx={headCell}>Allocated</TableCell>
                <TableCell align="right" sx={headCell}>Planted</TableCell>
                <TableCell align="right" sx={headCell}>Remaining to be Planted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {speciesSummary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: TEXT_SECONDARY }}>
                    No species assigned yet
                  </TableCell>
                </TableRow>
              ) : speciesSummary.map((row) => {
                const sp = speciesList.find((s) => s.id === row.speciesId);
                const rem = row.target - row.withdrawn;
                return (
                  <TableRow key={row.speciesId} sx={{ '& td': { borderBottom: `1px solid ${BORDER_COLOR}` } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: TEXT_SECONDARY }}>{sp?.scientificName}</Typography>
                      <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>{sp?.commonName}</Typography>
                    </TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>{row.target.toLocaleString()}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>{row.readyToPlant.toLocaleString()}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ color: getWithdrawnColor(row.withdrawn, row.target) }}>{row.withdrawn.toLocaleString()}</Typography></TableCell>
                    <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 500, color: getRemainingPlantedColor(rem, row.target) }}>{rem.toLocaleString()}</Typography></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Collapse>

      {/* Stratum sections */}
      <Stack spacing={4}>
        {siteStrata.map((stratum) => {
          const stratumSubstrata = substrata.filter((s) => s.stratumId === stratum.id);
          const activeSubstrata = stratumSubstrata.filter(
            (sub) => stratumTargets.some((t) => t.stratumId === sub.id) || addingToStratumId === sub.id
          );
          const inactiveSubstrata = stratumSubstrata.filter(
            (sub) => !stratumTargets.some((t) => t.stratumId === sub.id) && addingToStratumId !== sub.id
          );
          const stratumGoal = stratumTargets
            .filter((t) => stratumSubstrata.some((sub) => sub.id === t.stratumId))
            .reduce((s, t) => s + t.target, 0);
          const stratumWithdrawn = stratumTargets
            .filter((t) => stratumSubstrata.some((sub) => sub.id === t.stratumId))
            .reduce((s, t) => s + t.withdrawn, 0);

          return (
            <Box key={stratum.id}>
              {/* Stratum section divider header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: TEXT_PRIMARY, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {stratum.name}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: BORDER_COLOR }} />
                <Typography variant="caption" sx={{ color: TEXT_SECONDARY, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  Goal: {stratumGoal.toLocaleString()} · Planted: {stratumWithdrawn.toLocaleString()} · Remaining: {(stratumGoal - stratumWithdrawn).toLocaleString()}
                </Typography>
              </Box>

              {/* Active substratum sections */}
              {activeSubstrata.map((sub) => (
                <SubstratumSection
                  key={sub.id}
                  substratum={sub}
                  season={season}
                  stratumTargets={stratumTargets}
                  updateTarget={updateTarget}
                  deleteSpecies={deleteSpecies}
                  addSpecies={addSpecies}
                  addingToStratumId={addingToStratumId}
                  setAddingToStratumId={setAddingToStratumId}
                  showAllSpecies={showAllSpecies}
                  setShowAllSpecies={setShowAllSpecies}
                  setWithdrawTarget={setWithdrawTarget}
                  onNavigateToProgress={onNavigateToProgress}
                />
              ))}

              {/* Inactive substrata — add buttons */}
              {inactiveSubstrata.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: activeSubstrata.length > 0 ? 0 : 1 }}>
                  {inactiveSubstrata.map((sub) => (
                    <Typography
                      key={sub.id}
                      variant="body2"
                      sx={{ color: PRIMARY_GREEN, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      onClick={() => setAddingToStratumId(sub.id)}
                    >
                      + {sub.name}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

// --- Season card ---

interface SeasonCardProps {
  season: Season;
  onViewSeason: () => void;
  onDelete: () => void;
  stratumTargets: StratumTarget[];
}

function SeasonCard({ season, onViewSeason, onDelete, stratumTargets }: SeasonCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const active = season.forceActive || isSeasonActive(season.startDate, season.endDate);

  // Compute totals from live stratum targets
  const totalTargets = stratumTargets.reduce((s, t) => s + t.target, 0);
  const totalPlanted = stratumTargets.reduce((s, t) => s + t.withdrawn, 0);
  const progress = totalTargets > 0 ? (totalPlanted / totalTargets) * 100 : 0;
  const progressBarColor = progress >= 80 ? '#4CAF50' : progress >= 41 ? '#FF9800' : '#F44336';

  // Substrata that have at least one species with a planted goal
  const activeStrataIds = [...new Set(stratumTargets.filter((t) => t.target > 0).map((t) => t.stratumId))];
  // Parent strata that have at least one substratum with a planted goal
  const activeParentStrataIds = [...new Set(
    substrata.filter((sub) => activeStrataIds.includes(sub.id)).map((sub) => sub.stratumId)
  )];

  return (
    <Box
      sx={{
        p: 3,
        mb: 2,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: '8px',
        bgcolor: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '77px',
      }}
    >
      {/* Metrics section (flex:1) — header + metrics row stacked vertically */}
      <Box sx={{ flex: 1 }}>
        {/* Header: Name + edit | Date + edit | Status pill */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '31px', mb: '34px', flexWrap: 'wrap' }}>
          {/* Name */}
          <Typography sx={{ fontSize: 20, fontWeight: 500, color: '#000' }}>
            {season.name}
          </Typography>

          {/* Date range */}
          {season.startDate && season.endDate && (
            <Typography sx={{ fontSize: 16, fontWeight: 400, color: '#7F785C' }}>
              {formatDateRange(season.startDate, season.endDate)}
            </Typography>
          )}

          {active && (
            <Chip
              label="Active"
              size="small"
              sx={{
                bgcolor: '#EBF2DB',
                color: '#5C832B',
                border: '1px solid #5C832B',
                fontWeight: 500,
                fontSize: '0.875rem',
                px: 0.5,
              }}
            />
          )}
        </Box>

        {/* Metrics row: Progress | Planted Goal | Total Planted | Strata */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
          {/* Progress */}
          <Box sx={{ minWidth: 220, pr: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#000', mb: '8px' }}>
              Progress
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: '#E3E1D9',
                '& .MuiLinearProgress-bar': { bgcolor: progressBarColor, borderRadius: 6 },
              }}
            />
          </Box>

          {/* Planted Goal */}
          <Box sx={{ pl: 2, pr: 2, borderLeft: '1px solid #E3E1D9', minWidth: 120 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#000', mb: '8px' }}>
              Planted Goal
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 600, color: '#000', lineHeight: 1.2 }}>
              {totalTargets.toLocaleString()}
            </Typography>
          </Box>

          {/* Total Planted */}
          <Box sx={{ pl: 2, pr: 2, borderLeft: '1px solid #E3E1D9', minWidth: 120 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#000', mb: '8px' }}>
              Total Planted
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 600, color: '#000', lineHeight: 1.2 }}>
              {totalPlanted.toLocaleString()}
            </Typography>
          </Box>

          {/* Strata */}
          {activeParentStrataIds.length > 0 && (
            <Box sx={{ pl: 2, pr: 2, borderLeft: '1px solid #E3E1D9' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#000', mb: '8px' }}>
                Strata
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {strata.filter((st) => activeParentStrataIds.includes(st.id)).map((st) => (
                  <Chip
                    key={st.id}
                    label={st.name}
                    size="small"
                    sx={{
                      bgcolor: '#F2F0EE',
                      color: '#7F785C',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      px: 0.5,
                      height: 28,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Substrata */}
          {activeStrataIds.length > 0 && (
            <Box sx={{ pl: 2, borderLeft: '1px solid #E3E1D9' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#000', mb: '8px' }}>
                Substrata
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {substrata.filter((st) => activeStrataIds.includes(st.id)).map((st) => (
                  <Chip
                    key={st.id}
                    label={st.name}
                    size="small"
                    sx={{
                      bgcolor: '#F2F0EE',
                      color: '#7F785C',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      px: 0.5,
                      height: 28,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Actions — vertically centered by parent alignItems:center */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Button label="Manage Planting Season" onClick={onViewSeason} priority="secondary" />
        <IconButton
          size="small"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{ color: TEXT_SECONDARY }}
        >
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => { setMenuAnchor(null); setDeleteDialogOpen(true); }}
          sx={{ color: COLOR_GAP }}
        >
          Delete
        </MenuItem>
      </Menu>

      <DialogBox
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title={active ? 'Delete Active Season?' : 'Delete Season?'}
        size="medium"
        scrolled
        middleButtons={[
          <Button key="cancel" label="Cancel" onClick={() => setDeleteDialogOpen(false)} priority="secondary" />,
          <Button
            key="delete"
            label="Delete"
            onClick={() => { setDeleteDialogOpen(false); onDelete(); }}
          />,
        ]}
      >
        {active ? (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            <strong>{season.name}</strong> is currently active. Deleting it will permanently remove all
            targets, withdrawals, and progress data for this season. This cannot be undone.
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ color: TEXT_PRIMARY }}>
            Are you sure you want to delete <strong>{season.name}</strong>? This cannot be undone.
          </Typography>
        )}
      </DialogBox>
    </Box>
  );
}

// --- Withdrawal Log page ---

type WithdrawalRow = {
  id: string;
  date: string;
  dateDisplay: string;
  purpose: string;
  nurseryName: string;
  plantingSiteName: string;
  plantingSeasonName: string;
  stratumName: string;
  substratumName: string;
  speciesScientific: string;
  speciesCommon: string;
  quantity: number;
};

export function WithdrawalLogView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initSubstratumId = searchParams.get('substratumId') ?? 'all';
  const initPurpose      = searchParams.get('purpose')      ?? 'all';
  const initSeasonId     = searchParams.get('seasonId')     ?? 'all';
  const initSiteId       = searchParams.get('siteId')       ?? 'all';
  const initSpeciesId    = searchParams.get('speciesId')    ?? 'all';

  // Resolve display names once
  const tableData = useMemo<WithdrawalRow[]>(() =>
    [...mockWithdrawals]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((w) => {
        const sub = substrata.find((s) => s.id === w.substratumId);
        const stratum = strata.find((s) => s.id === sub?.stratumId);
        const sp = speciesList.find((s) => s.id === w.speciesId);
        const season = nurseryPlanningSeasons.find((s) => s.id === w.plantingSeasonId);
        return {
          id: w.id,
          date: w.date,
          dateDisplay: formatDate(w.date),
          purpose: w.purpose,
          nurseryName: w.nurseryName,
          plantingSiteName: w.plantingSiteName,
          plantingSeasonName: season?.name ?? '—',
          stratumName: stratum?.name ?? '—',
          substratumName: sub?.name ?? '—',
          speciesScientific: sp?.scientificName ?? '—',
          speciesCommon: sp?.commonName ?? '',
          quantity: w.quantity,
        };
      }),
  []);

  // Build initial MRT column filters from URL params
  const initialColumnFilters = useMemo(() => {
    const filters: { id: string; value: unknown }[] = [];
    if (initPurpose !== 'all') filters.push({ id: 'purpose', value: initPurpose });
    if (initSubstratumId !== 'all') {
      const sub = substrata.find((s) => s.id === initSubstratumId);
      if (sub) filters.push({ id: 'substratumName', value: [sub.name] });
    }
    if (initSeasonId !== 'all') {
      const season = nurseryPlanningSeasons.find((s) => s.id === initSeasonId);
      if (season) filters.push({ id: 'plantingSeasonName', value: [season.name] });
    }
    if (initSiteId !== 'all') {
      const site = plantingSites.find((s) => s.id === initSiteId);
      if (site) filters.push({ id: 'plantingSiteName', value: [site.name] });
    }
    if (initSpeciesId !== 'all') {
      const sp = speciesList.find((s) => s.id === initSpeciesId);
      if (sp) filters.push({ id: 'speciesScientific', value: [sp.scientificName] });
    }
    return filters;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo<MRT_ColumnDef<WithdrawalRow>[]>(() => [
    {
      accessorKey: 'dateDisplay',
      header: 'Date',
      enableColumnFilter: false,
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ color: PRIMARY_GREEN }}>
          {cell.getValue<string>()}
        </Typography>
      ),
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
      size: 130,
      filterVariant: 'select',
      filterSelectOptions: ['Planting', 'Nursery Transfer', 'Dead', 'Other'],
    },
    {
      accessorKey: 'nurseryName',
      header: 'From: Nursery',
      size: 140,
      filterVariant: 'select',
      filterSelectOptions: [...new Set(mockWithdrawals.map((w) => w.nurseryName))],
    },
    {
      accessorKey: 'plantingSiteName',
      header: 'Planting Site',
      filterVariant: 'multi-select',
      filterSelectOptions: [...new Set(mockWithdrawals.map((w) => w.plantingSiteName))],
    },
    {
      accessorKey: 'plantingSeasonName',
      header: 'Planting Season',
      filterVariant: 'multi-select',
      filterSelectOptions: [...new Set(nurseryPlanningSeasons.map((s) => s.name))],
    },
    {
      accessorKey: 'stratumName',
      header: 'To: Stratum',
      filterVariant: 'multi-select',
      filterSelectOptions: strata.map((s) => s.name),
    },
    {
      accessorKey: 'substratumName',
      header: 'To: Substratum',
      filterVariant: 'multi-select',
      filterSelectOptions: substrata.map((s) => s.name),
    },
    {
      accessorKey: 'speciesScientific',
      header: 'Species',
      filterVariant: 'multi-select',
      filterSelectOptions: [...new Set(tableData.map((r) => r.speciesScientific))],
      Cell: ({ row }) => (
        <>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            {row.original.speciesScientific}
          </Typography>
          <Typography variant="caption" sx={{ color: TEXT_SECONDARY }}>
            {row.original.speciesCommon}
          </Typography>
        </>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Total Quantity',
      enableColumnFilter: false,
      size: 110,
      muiTableHeadCellProps: { align: 'right' },
      muiTableBodyCellProps: { align: 'right' },
      Cell: ({ cell }) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {cell.getValue<number>().toLocaleString()}
        </Typography>
      ),
    },
  ], [tableData]);

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    initialState: {
      density: 'compact',
      showColumnFilters: initialColumnFilters.length > 0,
      columnFilters: initialColumnFilters,
      sorting: [{ id: 'dateDisplay', desc: false }],
    },
    enableColumnFilters: true,
    enableGlobalFilter: true,
    muiSearchTextFieldProps: { placeholder: 'Search withdrawals…', size: 'small' },
    muiTablePaperProps: {
      sx: { border: `1px solid ${BORDER_COLOR}`, borderRadius: 1, boxShadow: 'none' },
    },
    muiTableHeadRowProps: { sx: { bgcolor: HEADER_BG } },
    muiTableHeadCellProps: {
      sx: { fontWeight: 600, color: TEXT_PRIMARY, borderBottom: `1px solid ${BORDER_COLOR}` },
    },
    muiTableBodyCellProps: { sx: { borderBottom: `1px solid ${BORDER_COLOR}` } },
    muiFilterTextFieldProps: { size: 'small' },
    renderTopToolbarCustomActions: () => (
      <Typography variant="h5" sx={{ fontWeight: 600, color: TEXT_PRIMARY, alignSelf: 'center', pl: 1 }}>
        Withdrawals
      </Typography>
    ),
    onColumnFiltersChange: () => {
      // Clear URL params when user manually changes filters
      setSearchParams(new URLSearchParams());
    },
  });

  return <MaterialReactTable table={table} />;
}

// --- Main component ---

export function PlantingSeasons({ initialSeasonId }: { initialSeasonId?: string } = {}) {
  const navigate = useNavigate();
  const initialSeason = initialSeasonId
    ? nurseryPlanningSeasons.find((s) => s.id === initialSeasonId) ?? null
    : null;

  const [selectedSiteId, setSelectedSiteId] = useState(initialSeason?.siteId ?? 'ps1');
  const [allSeasons, setAllSeasons] = useState<Season[]>(() =>
    nurseryPlanningSeasons.map((s) => ({ ...s }))
  );
  const seasons = allSeasons
    .filter((s) => s.siteId === selectedSiteId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  // Stratum targets per season — lifted from ViewPlantingSeasonView so changes reflect in cards
  const [seasonStratumTargets, setSeasonStratumTargets] = useState<Record<string, StratumTarget[]>>(
    () => Object.fromEntries(nurseryPlanningSeasons.map((s) => [s.id, makeStratumTargets(s.id)]))
  );
  const [siteSummaryOpen, setSiteSummaryOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [viewingSeason, setViewingSeason] = useState<Season | null>(initialSeason);

  const handleCreateSeason = () => {
    if (!newSeasonName.trim()) return;
    const newId = `season-${Date.now()}`;
    const newSeason: Season = {
      id: newId,
      name: newSeasonName.trim(),
      startDate: newStartDate,
      endDate: newEndDate,
      siteId: selectedSiteId,
    };
    setAllSeasons((prev) => [...prev, newSeason]);
    setSeasonStratumTargets((prev) => ({ ...prev, [newId]: [] }));
    setNewSeasonName('');
    setNewStartDate('');
    setNewEndDate('');
    setCreateDialogOpen(false);
    setViewingSeason(newSeason);
  };

  const handleCloseDialog = () => {
    setNewSeasonName('');
    setNewStartDate('');
    setNewEndDate('');
    setCreateDialogOpen(false);
  };

  if (viewingSeason) {
    return (
      <ViewPlantingSeasonView
        season={viewingSeason}
        onBack={() => setViewingSeason(null)}
        stratumTargets={seasonStratumTargets[viewingSeason.id] ?? []}
        onStratumTargetsChange={(targets) =>
          setSeasonStratumTargets((prev) => ({ ...prev, [viewingSeason.id]: targets }))
        }
        onSeasonUpdate={(updated) => {
          setAllSeasons((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          setViewingSeason(updated);
        }}
        onNavigateToProgress={({ substratumId, speciesId, seasonId, siteId }) => {
          const params = new URLSearchParams({ purpose: 'Planting', substratumId, seasonId, siteId });
          if (speciesId) params.set('speciesId', speciesId);
          navigate(`../withdrawal-log?${params.toString()}`);
        }}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: TEXT_PRIMARY }}>
          Planting Seasons
        </Typography>
        <Typography variant="body2" sx={{ color: TEXT_SECONDARY, fontWeight: 500 }}>
          Planting Site:
        </Typography>
        <Select
          size="small"
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {plantingSites.map((site) => (
            <MenuItem key={site.id} value={site.id}>
              {site.name}
            </MenuItem>
          ))}
        </Select>
        <Box sx={{ flex: 1 }} />
        <Button label="Add Planting Season" onClick={() => setCreateDialogOpen(true)} />
      </Box>

      {seasons.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 10,
                bgcolor: '#fff',
                borderRadius: '8px',
                border: `1px solid ${BORDER_COLOR}`,
              }}
            >
              <Typography variant="body1" sx={{ color: TEXT_SECONDARY, mb: 3 }}>
                You have not set up any planting seasons
              </Typography>
              <Button label="Add Planting Season" onClick={() => setCreateDialogOpen(true)} />
            </Box>
          ) : (() => {
            const sortedSeasons = [...seasons].sort((a, b) => b.startDate.localeCompare(a.startDate));

            // Site-wide totals across all seasons
            const allTargetsForSite = seasons.flatMap((s) => seasonStratumTargets[s.id] ?? []);
            const siteGoal = allTargetsForSite.reduce((sum, t) => sum + t.target, 0);
            const sitePlanted = allTargetsForSite.reduce((sum, t) => sum + t.withdrawn, 0);
            const siteRemaining = siteGoal - sitePlanted;
            const siteSpeciesIds = [...new Set(allTargetsForSite.map((t) => t.speciesId))];
            const siteSpecies = siteSpeciesIds
              .map((id) => speciesList.find((sp) => sp.id === id))
              .filter(Boolean)
              .sort((a, b) => a!.scientificName.localeCompare(b!.scientificName));

            return (
              <>
                {/* Site summary bar */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`Goal: ${siteGoal.toLocaleString()}`} size="small" variant="outlined"
                      sx={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR }} />
                    <Chip label={`Planted: ${sitePlanted.toLocaleString()}`} size="small" variant="outlined"
                      sx={{ color: sitePlanted > 0 ? COLOR_FULFILLED : TEXT_SECONDARY, borderColor: BORDER_COLOR }} />
                    <Chip label={`Remaining: ${siteRemaining.toLocaleString()}`} size="small" variant="outlined"
                      sx={{ color: siteRemaining > 0 ? COLOR_PARTIAL : COLOR_FULFILLED, borderColor: BORDER_COLOR }} />
                    <Chip
                      label={`${siteSpecies.length} species ${siteSummaryOpen ? '↑' : '↓'}`}
                      size="small"
                      variant="outlined"
                      onClick={() => setSiteSummaryOpen((v) => !v)}
                      sx={{ color: TEXT_PRIMARY, borderColor: BORDER_COLOR, cursor: 'pointer' }}
                    />
                  </Box>
                  <Collapse in={siteSummaryOpen}>
                    <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {siteSpecies.map((sp) => (
                        <Typography key={sp!.id} variant="caption"
                          sx={{ color: TEXT_SECONDARY, bgcolor: '#F5F5F0', px: 1, py: 0.25, borderRadius: 0.5 }}>
                          {sp!.scientificName} ({sp!.commonName})
                        </Typography>
                      ))}
                    </Box>
                  </Collapse>
                </Box>

                {sortedSeasons.map((season) => (
                  <SeasonCard
                    key={season.id}
                    season={season}
                    onViewSeason={() => setViewingSeason(season)}
                    onDelete={() => setAllSeasons((prev) => prev.filter((s) => s.id !== season.id))}
                    stratumTargets={seasonStratumTargets[season.id] ?? []}
                  />
                ))}
              </>
            );
          })()}

      {/* Create Season Dialog */}
      <DialogBox
        open={createDialogOpen}
        onClose={handleCloseDialog}
        title="Create Planting Season"
        size="medium"
        scrolled
        middleButtons={[
          <Button key="cancel" label="Cancel" onClick={handleCloseDialog} priority="secondary" />,
          <Button
            key="save"
            label="Next"
            onClick={handleCreateSeason}
            disabled={!newSeasonName.trim()}
          />,
        ]}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Name"
            value={newSeasonName}
            onChange={(e) => setNewSeasonName(e.target.value)}
            fullWidth
            autoFocus
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Date"
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </Box>
      </DialogBox>
    </Box>
  );
}
