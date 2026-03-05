import { create } from "zustand";
import type { Metadata, ViewMode, ActiveSelection, CompareDisplayMode, CompareSlot } from "../types/metadata";

interface AppState {
  // Data
  metadata: Metadata | null;
  isLoading: boolean;
  error: string | null;

  // Navigation
  expandedDrawings: Set<string>;
  activeDrawingId: string | null;

  // View
  viewMode: ViewMode;
  primarySelection: ActiveSelection | null;
  compareSlots: CompareSlot[];
  compareDisplayMode: CompareDisplayMode;
  layerOpacities: Record<string, number>;

  // Actions
  setMetadata: (metadata: Metadata) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  toggleDrawingExpanded: (drawingId: string) => void;
  expandDrawing: (drawingId: string) => void;
  setActiveDrawingId: (drawingId: string | null) => void;

  setViewMode: (mode: ViewMode) => void;
  setPrimarySelection: (selection: ActiveSelection | null) => void;
  addCompareSlot: (slot: Omit<CompareSlot, 'id'>) => void;
  removeCompareSlot: (slotId: string) => void;
  updateCompareSlotRevision: (slotId: string, version: string) => void;
  clearCompareSlots: () => void;
  setCompareDisplayMode: (mode: CompareDisplayMode) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  metadata: null,
  isLoading: false,
  error: null,

  expandedDrawings: new Set<string>(),
  activeDrawingId: null,

  viewMode: "single",
  primarySelection: null,
  compareSlots: [],
  compareDisplayMode: "overlay",
  layerOpacities: {},

  setMetadata: (metadata) => set({ metadata }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  toggleDrawingExpanded: (drawingId) =>
    set((state) => {
      const next = new Set(state.expandedDrawings);
      if (next.has(drawingId)) {
        next.delete(drawingId);
      } else {
        next.add(drawingId);
      }
      return { expandedDrawings: next };
    }),

  expandDrawing: (drawingId) => {
    const { metadata } = get();
    if (!metadata) return;

    const next = new Set(get().expandedDrawings);

    let current = metadata.drawings[drawingId];

    while (current?.parent) {
      next.add(current.parent);
      current = metadata.drawings[current.parent];
    }

    next.add(drawingId);

    set({ expandedDrawings: next });
  },

  setActiveDrawingId: (drawingId) => set({ activeDrawingId: drawingId }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setPrimarySelection: (selection) => set({ primarySelection: selection }),

  addCompareSlot: (slotData) => {
    const id = `${slotData.drawingId}__${slotData.disciplineName}__${slotData.regionId ?? 'base'}__${slotData.revisionVersion}`;
    set((state) => {
      if (state.compareSlots.length >= 4) return state;
      if (state.compareSlots.some(s => s.id === id)) return state;
      return { compareSlots: [...state.compareSlots, { ...slotData, id }] };
    });
  },

  removeCompareSlot: (slotId) =>
    set((state) => ({
      compareSlots: state.compareSlots.filter(s => s.id !== slotId),
    })),

  updateCompareSlotRevision: (slotId, version) =>
    set((state) => ({
      compareSlots: state.compareSlots.map(s =>
        s.id === slotId
          ? { ...s, revisionVersion: version, id: `${s.drawingId}__${s.disciplineName}__${s.regionId ?? 'base'}__${version}` }
          : s
      ),
    })),

  clearCompareSlots: () => set({ compareSlots: [] }),

  setCompareDisplayMode: (mode) => set({ compareDisplayMode: mode }),

  setLayerOpacity: (id, opacity) =>
    set((state) => ({
      layerOpacities: { ...state.layerOpacities, [id]: opacity },
    })),
}));
