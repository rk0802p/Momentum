import { create } from 'zustand';
import type { EnvironmentType, SpatialMode, SnapInterval, CalendarEvent } from '@momentum/shared-types';

interface NavigationState {
  environment: EnvironmentType;
  activeDate: string; // YYYY-MM-DD
  selectedEventId: string | null;
  zoomLevel: number;
  spatialMode: SpatialMode;
  snapMinutes: SnapInterval;
  timezone: string;
  isEditorOpen: boolean;
  editorPrefill: Partial<CalendarEvent> | null;
  isCommandPaletteOpen: boolean;

  setEnvironment: (env: EnvironmentType) => void;
  setActiveDate: (date: string) => void;
  setSelectedEventId: (id: string | null) => void;
  setZoomLevel: (zoom: number) => void;
  setSpatialMode: (mode: SpatialMode) => void;
  setSnapMinutes: (snap: SnapInterval) => void;
  setTimezone: (tz: string) => void;
  openEditor: (prefill?: Partial<CalendarEvent>) => void;
  closeEditor: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  environment: 'now',
  activeDate: '2026-11-02',
  selectedEventId: 'evt-2',
  zoomLevel: 1.0,
  spatialMode: 'radial',
  snapMinutes: 15,
  timezone: 'Asia/Kolkata',
  isEditorOpen: false,
  editorPrefill: null,
  isCommandPaletteOpen: false,

  setEnvironment: (environment) => set({ environment }),
  setActiveDate: (activeDate) => set({ activeDate }),
  setSelectedEventId: (selectedEventId) => set({ selectedEventId }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setSpatialMode: (spatialMode) => set({ spatialMode }),
  setSnapMinutes: (snapMinutes) => set({ snapMinutes }),
  setTimezone: (timezone) => set({ timezone }),
  openEditor: (editorPrefill = {}) => set({ isEditorOpen: true, editorPrefill }),
  closeEditor: () => set({ isEditorOpen: false, editorPrefill: null }),
  setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen })
}));
