/**
 * Shared planning context — links NurseryPlanning ↔ PlantingSeasons.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

export interface ChangeRecord {
  id: string;
  timestamp: string;
  source: 'Planting Seasons' | 'Nursery Planning';
  speciesName: string;
  seasonName: string;
  field: 'Requested' | 'Allocated';
  oldValue: number;
  newValue: number;
}

interface PlanningContextValue {
  requestedOverrides: Record<string, Record<string, number>>;
  allocationOverrides: Record<string, Record<string, number>>;
  updateRequested: (
    speciesId: string, seasonId: string,
    newValue: number, oldValue: number,
    speciesName: string, seasonName: string,
  ) => void;
  updateAllocation: (
    speciesId: string, seasonId: string,
    newValue: number, oldValue: number,
    speciesName: string, seasonName: string,
  ) => void;
  nurseryNotification: boolean;
  plantingNotification: boolean;
  dismissNurseryNotification: () => void;
  dismissPlantingNotification: () => void;
  changeHistory: ChangeRecord[];
}

const PlanningContext = createContext<PlanningContextValue | null>(null);

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [requestedOverrides, setRequestedOverrides] = useState<Record<string, Record<string, number>>>({});
  const [allocationOverrides, setAllocationOverrides] = useState<Record<string, Record<string, number>>>({});
  const [nurseryNotification, setNurseryNotification] = useState(false);
  const [plantingNotification, setPlantingNotification] = useState(false);
  const [changeHistory, setChangeHistory] = useState<ChangeRecord[]>([]);

  const updateRequested = (
    speciesId: string, seasonId: string,
    newValue: number, oldValue: number,
    speciesName: string, seasonName: string,
  ) => {
    setRequestedOverrides(prev => ({
      ...prev,
      [speciesId]: { ...(prev[speciesId] ?? {}), [seasonId]: newValue },
    }));
    setNurseryNotification(true);
    const key = `req-${speciesId}-${seasonId}`;
    setChangeHistory(prev => {
      const idx = prev.findIndex(r => r.id === key);
      const record: ChangeRecord = {
        id: key,
        timestamp: new Date().toLocaleString(),
        source: 'Planting Seasons',
        speciesName,
        seasonName,
        field: 'Requested',
        oldValue: idx >= 0 ? prev[idx].oldValue : oldValue,
        newValue,
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [record, ...prev];
    });
  };

  const updateAllocation = (
    speciesId: string, seasonId: string,
    newValue: number, oldValue: number,
    speciesName: string, seasonName: string,
  ) => {
    setAllocationOverrides(prev => ({
      ...prev,
      [speciesId]: { ...(prev[speciesId] ?? {}), [seasonId]: newValue },
    }));
    setPlantingNotification(true);
    const key = `alloc-${speciesId}-${seasonId}`;
    setChangeHistory(prev => {
      const idx = prev.findIndex(r => r.id === key);
      const record: ChangeRecord = {
        id: key,
        timestamp: new Date().toLocaleString(),
        source: 'Nursery Planning',
        speciesName,
        seasonName,
        field: 'Allocated',
        oldValue: idx >= 0 ? prev[idx].oldValue : oldValue,
        newValue,
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [record, ...prev];
    });
  };

  return (
    <PlanningContext.Provider value={{
      requestedOverrides,
      allocationOverrides,
      updateRequested,
      updateAllocation,
      nurseryNotification,
      plantingNotification,
      dismissNurseryNotification: () => setNurseryNotification(false),
      dismissPlantingNotification: () => setPlantingNotification(false),
      changeHistory,
    }}>
      {children}
    </PlanningContext.Provider>
  );
}

export function usePlanningContext(): PlanningContextValue {
  const ctx = useContext(PlanningContext);
  if (!ctx) throw new Error('usePlanningContext must be used within PlanningProvider');
  return ctx;
}
