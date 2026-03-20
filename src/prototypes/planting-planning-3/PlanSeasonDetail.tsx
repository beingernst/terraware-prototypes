/**
 * Plan Season Detail Component
 *
 * Allows users to plan species distribution across zones for a specific planting season.
 * Features:
 * - Zone-by-zone species assignment
 * - Planting density targets and calculations
 * - Progress tracking toward density goals
 * - Save/discard changes
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Page } from '@/components/layout';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
} from '@mui/material';
import { Button } from '@terraware/web-components';
import {
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { mockSite, mockSpecies, MONTH_NAMES_FULL } from './mockData';
import type { SpeciesAssignment } from './mockData';

// Colors
const BORDER_COLOR = '#E8E5E0';
const TEXT_PRIMARY = '#3A4445';
const TEXT_SECONDARY = '#6B7165';
const CARD_BG = '#FFF';
const SUCCESS_COLOR = '#4CAF50';
const WARNING_COLOR = '#FF9800';
const ERROR_COLOR = '#F44336';
const INFO_COLOR = '#2196F3';

export default function PlanSeasonDetail() {
  const { seasonId } = useParams();
  const navigate = useNavigate();

  // Mock season data (in real app, would fetch based on seasonId)
  const season = {
    id: seasonId || 'season-1',
    name: 'Spring Planting 2025',
    startMonth: 2,
    endMonth: 4,
    year: 2025,
    zoneIds: ['z1', 'z2', 'z3'],
  };

  // State for species assignments per zone
  const [assignments, setAssignments] = useState<Record<string, SpeciesAssignment[]>>({});

  // State for density targets per zone
  const [densityTargets, setDensityTargets] = useState<Record<string, number>>({});

  // State for tracking unsaved changes
  const [hasChanges, setHasChanges] = useState(false);

  // State for adding species to a zone
  const [addingToZone, setAddingToZone] = useState<string | null>(null);
  const [selectedSpeciesToAdd, setSelectedSpeciesToAdd] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState('');

  // Get zones for this season
  const zones = mockSite.zones.filter((z) => season.zoneIds.includes(z.id));

  // Get total plants assigned to a zone
  const getZoneTotalPlants = (zoneId: string): number => {
    const zoneAssignments = assignments[zoneId] || [];
    return zoneAssignments.reduce((sum, a) => sum + a.quantity, 0);
  };

  // Get current density for a zone
  const getCurrentDensity = (zoneId: string): number => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return 0;
    const totalPlants = getZoneTotalPlants(zoneId);
    return totalPlants / zone.area;
  };

  // Get percentage toward target
  const getPercentageTowardTarget = (zoneId: string): number => {
    const target = densityTargets[zoneId];
    if (!target) return 0;
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return 0;
    const currentDensity = getCurrentDensity(zoneId);
    return (currentDensity / target) * 100;
  };

  // Get color for progress bar based on percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage === 0) return INFO_COLOR;
    if (percentage < 70) return ERROR_COLOR;
    if (percentage < 90) return WARNING_COLOR;
    if (percentage <= 110) return SUCCESS_COLOR;
    return WARNING_COLOR; // Over target
  };

  // Get species not yet assigned to a zone
  const getUnassignedSpecies = (zoneId: string): typeof mockSpecies => {
    const zoneAssignments = assignments[zoneId] || [];
    const assignedIds = new Set(zoneAssignments.map((a) => a.speciesId));
    return mockSpecies.filter((s) => !assignedIds.has(s.id));
  };

  // Handle density target change
  const handleDensityTargetChange = (zoneId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setDensityTargets({ ...densityTargets, [zoneId]: numValue });
      setHasChanges(true);
    } else if (value === '') {
      const newTargets = { ...densityTargets };
      delete newTargets[zoneId];
      setDensityTargets(newTargets);
      setHasChanges(true);
    }
  };

  // Handle add species
  const handleAddSpecies = (zoneId: string) => {
    if (!selectedSpeciesToAdd || !quantityToAdd) return;

    const quantity = parseInt(quantityToAdd);
    if (isNaN(quantity) || quantity <= 0) return;

    const newAssignment: SpeciesAssignment = {
      zoneId,
      seasonId: season.id,
      speciesId: selectedSpeciesToAdd,
      quantity,
    };

    setAssignments({
      ...assignments,
      [zoneId]: [...(assignments[zoneId] || []), newAssignment],
    });

    setHasChanges(true);
    setAddingToZone(null);
    setSelectedSpeciesToAdd('');
    setQuantityToAdd('');
  };

  // Handle update quantity
  const handleUpdateQuantity = (zoneId: string, speciesId: string, value: string) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity <= 0) return;

    const zoneAssignments = assignments[zoneId] || [];
    const updated = zoneAssignments.map((a) =>
      a.speciesId === speciesId ? { ...a, quantity } : a
    );

    setAssignments({ ...assignments, [zoneId]: updated });
    setHasChanges(true);
  };

  // Handle remove species
  const handleRemoveSpecies = (zoneId: string, speciesId: string) => {
    const zoneAssignments = assignments[zoneId] || [];
    const filtered = zoneAssignments.filter((a) => a.speciesId !== speciesId);

    setAssignments({ ...assignments, [zoneId]: filtered });
    setHasChanges(true);
  };

  // Handle save
  const handleSave = () => {
    // In real app, would persist to backend
    setHasChanges(false);
  };

  // Handle discard
  const handleDiscard = () => {
    // In real app, would revert to saved state
    setHasChanges(false);
  };

  // Get species name
  const getSpeciesName = (speciesId: string): string => {
    const species = mockSpecies.find((s) => s.id === speciesId);
    return species ? species.commonName : 'Unknown';
  };

  // Get species scientific name
  const getSpeciesScientificName = (speciesId: string): string => {
    const species = mockSpecies.find((s) => s.id === speciesId);
    return species ? species.scientificName : '';
  };

  return (
    <Page title={`Plan Season: ${season.name}`} maxWidth={false}>
      {/* Back button */}
      <Box sx={{ mb: 3 }}>
        <Button
          label="Back to Plan"
          onClick={() => navigate('/prototypes/planting-planning-3/plan')}
          type="passive"
        />
      </Box>

      {/* Season info header */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          backgroundColor: '#E8F5E9',
          borderRadius: '8px',
          border: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: TEXT_PRIMARY, mb: 1 }}>
          {season.name}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: TEXT_SECONDARY }}>
          {MONTH_NAMES_FULL[season.startMonth]} - {MONTH_NAMES_FULL[season.endMonth]} {season.year} • {zones.length} zones
        </Typography>
      </Box>

      {/* Sticky header with save/discard (when changes exist) */}
      {hasChanges && (
        <Box
          sx={{
            position: 'sticky',
            top: 60,
            zIndex: 100,
            backgroundColor: '#FFF',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            mb: 3,
            p: 2,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: '14px', color: TEXT_SECONDARY }}>
            You have unsaved changes
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button label="Discard Changes" onClick={handleDiscard} type="passive" />
            <Button label="Save Changes" onClick={handleSave} type="productive" priority="primary" />
          </Box>
        </Box>
      )}

      {/* Zone cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {zones.map((zone) => {
          const zoneAssignments = assignments[zone.id] || [];
          const unassignedSpecies = getUnassignedSpecies(zone.id);
          const targetDensity = densityTargets[zone.id] || 0;
          const currentDensity = getCurrentDensity(zone.id);
          const percentage = getPercentageTowardTarget(zone.id);
          const progressColor = getProgressColor(percentage);
          const totalPlants = getZoneTotalPlants(zone.id);

          return (
            <Box
              key={zone.id}
              sx={{
                border: `1px solid ${BORDER_COLOR}`,
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: CARD_BG,
              }}
            >
              {/* Zone header */}
              <Box
                sx={{
                  p: 3,
                  backgroundColor: '#F5F5F0',
                  borderBottom: `1px solid ${BORDER_COLOR}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: TEXT_PRIMARY }}>
                      {zone.name}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: TEXT_SECONDARY, mt: 0.5 }}>
                      {zone.area} hectares
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY, mb: 0.5 }}>
                      Total Plants
                    </Typography>
                    <Typography sx={{ fontSize: '20px', fontWeight: 600, color: TEXT_PRIMARY }}>
                      {totalPlants.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Density calculator */}
              <Box sx={{ p: 3, borderBottom: `1px solid ${BORDER_COLOR}`, backgroundColor: '#FAFAFA' }}>
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY, mb: 0.5 }}>
                      Target Density (plants/ha)
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={targetDensity || ''}
                      onChange={(e) => handleDensityTargetChange(zone.id, e.target.value)}
                      placeholder="Enter target"
                      inputProps={{ min: 0, step: 10 }}
                    />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY, mb: 0.5 }}>
                      Current Density
                    </Typography>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600, color: TEXT_PRIMARY }}>
                      {currentDensity.toFixed(1)} plants/ha
                    </Typography>
                  </Box>

                  {targetDensity > 0 && (
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY, mb: 0.5 }}>
                        Progress
                      </Typography>
                      <Typography sx={{ fontSize: '18px', fontWeight: 600, color: progressColor }}>
                        {percentage.toFixed(0)}%
                      </Typography>
                    </Box>
                  )}
                </Box>

                {targetDensity > 0 && (
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#E0E0E0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: progressColor,
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography sx={{ fontSize: '11px', color: TEXT_SECONDARY, mt: 0.5 }}>
                      {percentage < 70 && 'Significantly below target'}
                      {percentage >= 70 && percentage < 90 && 'Below target'}
                      {percentage >= 90 && percentage <= 110 && 'On target'}
                      {percentage > 110 && 'Above target'}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Species assignments */}
              <Box sx={{ p: 3 }}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: TEXT_PRIMARY, mb: 2 }}>
                  Species Assignments
                </Typography>

                {zoneAssignments.length > 0 ? (
                  <Table size="small" sx={{ mb: 2 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Common Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px' }}>Scientific Name</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', textAlign: 'right' }}>
                          Quantity
                        </TableCell>
                        <TableCell sx={{ width: 50 }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {zoneAssignments.map((assignment) => (
                        <TableRow key={assignment.speciesId}>
                          <TableCell sx={{ fontSize: '13px' }}>
                            {getSpeciesName(assignment.speciesId)}
                          </TableCell>
                          <TableCell sx={{ fontSize: '12px', fontStyle: 'italic', color: TEXT_SECONDARY }}>
                            {getSpeciesScientificName(assignment.speciesId)}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right' }}>
                            <TextField
                              type="number"
                              size="small"
                              value={assignment.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(zone.id, assignment.speciesId, e.target.value)
                              }
                              inputProps={{ min: 1, style: { textAlign: 'right' } }}
                              sx={{ width: '100px' }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveSpecies(zone.id, assignment.speciesId)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      borderRadius: '6px',
                      textAlign: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography sx={{ fontSize: '13px', color: TEXT_SECONDARY, fontStyle: 'italic' }}>
                      No species assigned yet
                    </Typography>
                  </Box>
                )}

                {/* Add species form */}
                {addingToZone === zone.id ? (
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                    <FormControl size="small" sx={{ flex: 2 }}>
                      <Typography sx={{ fontSize: '12px', mb: 0.5, color: TEXT_SECONDARY }}>
                        Select Species
                      </Typography>
                      <Select
                        value={selectedSpeciesToAdd}
                        onChange={(e) => setSelectedSpeciesToAdd(e.target.value)}
                      >
                        {unassignedSpecies.map((species) => (
                          <MenuItem key={species.id} value={species.id}>
                            {species.commonName} ({species.scientificName})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      type="number"
                      size="small"
                      label="Quantity"
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(e.target.value)}
                      inputProps={{ min: 1 }}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      label="Add"
                      onClick={() => handleAddSpecies(zone.id)}
                      type="productive"
                      priority="primary"
                      size="small"
                    />
                    <Button
                      label="Cancel"
                      onClick={() => {
                        setAddingToZone(null);
                        setSelectedSpeciesToAdd('');
                        setQuantityToAdd('');
                      }}
                      type="passive"
                      size="small"
                    />
                  </Box>
                ) : unassignedSpecies.length > 0 ? (
                  <Button
                    label="Add Species"
                    onClick={() => setAddingToZone(zone.id)}
                    type="productive"
                    priority="secondary"
                    size="small"
                    icon="plus"
                  />
                ) : (
                  <Typography sx={{ fontSize: '12px', color: TEXT_SECONDARY, fontStyle: 'italic' }}>
                    All available species have been assigned
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Page>
  );
}
