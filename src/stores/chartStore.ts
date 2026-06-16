import { create } from 'zustand';
import type { BaziChart } from '../types/bazi';

interface ChartStore {
  charts: BaziChart[];
  currentChartId: string | null;
  addChart: (chart: BaziChart) => void;
  removeChart: (id: string) => void;
  setCurrentChart: (id: string | null) => void;
  getCurrentChart: () => BaziChart | undefined;
}

export const useChartStore = create<ChartStore>((set, get) => ({
  charts: [],
  currentChartId: null,

  addChart: (chart) => {
    set((state) => ({
      charts: [...state.charts, chart],
      currentChartId: chart.id,
    }));
  },

  removeChart: (id) => {
    set((state) => ({
      charts: state.charts.filter((c) => c.id !== id),
      currentChartId: state.currentChartId === id ? null : state.currentChartId,
    }));
  },

  setCurrentChart: (id) => set({ currentChartId: id }),

  getCurrentChart: () => {
    const { charts, currentChartId } = get();
    return charts.find((c) => c.id === currentChartId);
  },
}));
