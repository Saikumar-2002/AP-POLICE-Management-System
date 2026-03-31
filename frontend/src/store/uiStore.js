import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: window.innerWidth > 768,
  toasts: [],
  globalLoading: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),

  addToast: (toast) => {
    const id = Date.now() + Math.random();
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id }],
    }));
    setTimeout(() => {
      set((s) => ({
        toasts: s.toasts.filter((t) => t.id !== id),
      }));
    }, toast.duration || 4000);
    return id;
  },

  removeToast: (id) => set((s) => ({
    toasts: s.toasts.filter((t) => t.id !== id),
  })),
}));

export default useUiStore;
