import { create } from 'zustand';
import api from '../services/api';

const useUnitStore = create((set, get) => ({
  units: [],
  tree: [],
  selectedUnit: null,
  loading: false,
  error: null,
  stats: { total: 0, zones: 0, ranges: 0, districts: 0, divisions: 0, circles: 0, stations: 0 },

  fetchTree: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/units/tree');
      const tree = res.data.tree || res.data;
      const stats = res.data.stats || computeStats(tree);
      set({ tree, stats, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch hierarchy', loading: false });
    }
  },

  fetchAllUnits: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/units');
      set({ units: res.data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch units', loading: false });
    }
  },

  createUnit: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/units', data);
      await get().fetchTree();
      await get().fetchAllUnits();
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create unit', loading: false });
      throw err;
    }
  },

  updateUnit: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/units/${id}`, data);
      await get().fetchTree();
      await get().fetchAllUnits();
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update unit', loading: false });
      throw err;
    }
  },

  deleteUnit: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/units/${id}`);
      await get().fetchTree();
      await get().fetchAllUnits();
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete unit', loading: false });
      throw err;
    }
  },

  clearAllUnits: async () => {
    set({ loading: true, error: null });
    try {
      await api.delete('/units/all');
      set({ units: [], tree: [], stats: { total: 0, zones: 0, ranges: 0, districts: 0, divisions: 0, circles: 0, stations: 0 }, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to clear units', loading: false });
      throw err;
    }
  },

  uploadExcel: async (file, onProgress, clearExisting = false) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clearExisting', clearExisting);
      const res = await api.post('/upload/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      await get().fetchTree();
      await get().fetchAllUnits();
      set({ loading: false });
      return res.data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Upload failed', loading: false });
      throw err;
    }
  },

  setSelectedUnit: (unit) => set({ selectedUnit: unit }),
  clearError: () => set({ error: null }),
}));

function computeStats(tree) {
  const stats = { total: 0, zones: 0, ranges: 0, districts: 0, divisions: 0, circles: 0, stations: 0 };
  function walk(nodes) {
    for (const n of nodes) {
      stats.total++;
      const t = n.unit_type || n.unitType || '';
      if (t === 'zone') stats.zones++;
      else if (t === 'range') stats.ranges++;
      else if (t === 'district') stats.districts++;
      else if (t === 'division') stats.divisions++;
      else if (t === 'circle') stats.circles++;
      else if (t === 'station') stats.stations++;
      if (n.children) walk(n.children);
    }
  }
  walk(tree);
  return stats;
}

export default useUnitStore;
