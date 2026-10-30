import { create } from 'zustand';
import { Candidate, GateCandidate, PageView, ViewTab } from '../types';
import { loadDefaultExcel, parseUploadedExcel } from '../lib/excelParser';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  undoAction?: () => void;
  duration?: number;
}

export interface CrossFilter {
  source: string; // e.g. 'chart-gender', 'chart-posisi', 'kpi-lolos'
  key: string;    // e.g. 'gender', 'position_clean', 'screening_status'
  value: string;  // e.g. 'Laki-laki'
  label?: string; // e.g. 'Gender: Laki-laki'
}

interface KanbanHistoryItem {
  candidateId: string;
  previousStage: string;
  newStage: string;
  candidateName: string;
}

interface DashboardState {
  // Data
  candidates: Candidate[];
  gateCandidates: GateCandidate[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fileName: string;

  // View state
  activePage: PageView;
  activeTab: ViewTab;
  sidebarCollapsed: boolean;
  darkMode: boolean;
  maskPii: boolean; // Sembunyikan data pribadi

  // Filters
  datePreset: 'all' | 'today' | '7days' | '30days';
  startDate: string | null;
  endDate: string | null;
  selectedPosition: string | null;
  selectedOutlet: string | null;
  selectedCategory: string | null;
  selectedStage: string | null;
  searchQuery: string;
  crossFilter: CrossFilter | null;

  // Interaction
  selectedCandidateId: string | null;
  selectedGateCandidateId: string | null;
  compareCandidateIds: string[];
  commandPaletteOpen: boolean;

  // Kanban history for undo
  kanbanHistory: KanbanHistoryItem[];

  // Toasts
  toasts: ToastItem[];

  // Actions
  initializeData: () => Promise<void>;
  uploadExcel: (file: File) => Promise<void>;
  setActivePage: (page: PageView) => void;
  setActiveTab: (tab: ViewTab) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  toggleMaskPii: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  // Filter actions
  setDatePreset: (preset: 'all' | 'today' | '7days' | '30days') => void;
  setDateRange: (start: string | null, end: string | null) => void;
  setSelectedPosition: (pos: string | null) => void;
  setSelectedOutlet: (outlet: string | null) => void;
  setSelectedCategory: (cat: string | null) => void;
  setSelectedStage: (stage: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCrossFilter: (filter: CrossFilter | null) => void;
  toggleCrossFilter: (filter: CrossFilter) => void;
  resetAllFilters: () => void;

  // Candidate selection & compare
  setSelectedCandidateId: (id: string | null) => void;
  setSelectedGateCandidateId: (id: string | null) => void;
  toggleCompareCandidate: (id: string) => void;
  clearCompareCandidates: () => void;

  // Kanban stage move & undo
  moveCandidateStage: (candidateId: string, newStage: string) => void;
  undoLastStageMove: () => void;

  // Toasts
  addToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error', undoAction?: () => void) => void;
  removeToast: (id: string) => void;
}

// Helper to read initial URL params
function getUrlParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    page: (params.get('page') as PageView) || 'kandidat',
    tab: (params.get('tab') === 'analitik' ? 'analitik' : 'cockpit') as ViewTab,
    preset: (params.get('date') as 'all' | 'today' | '7days' | '30days') || 'all',
    pos: params.get('pos') || null,
    outlet: params.get('outlet') || null,
    cat: params.get('cat') || null,
    stage: params.get('stage') || null,
    q: params.get('q') || '',
  };
}

// Helper to sync URL
function syncUrlWithState(state: Partial<DashboardState>) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);

  if (state.activePage && state.activePage !== 'kandidat') {
    url.searchParams.set('page', state.activePage);
  } else {
    url.searchParams.delete('page');
  }

  if (state.activeTab && state.activeTab !== 'analitik') {
    url.searchParams.set('tab', state.activeTab);
  } else {
    url.searchParams.delete('tab');
  }

  if (state.datePreset && state.datePreset !== 'all') {
    url.searchParams.set('date', state.datePreset);
  } else {
    url.searchParams.delete('date');
  }

  if (state.selectedPosition) {
    url.searchParams.set('pos', state.selectedPosition);
  } else {
    url.searchParams.delete('pos');
  }

  if (state.selectedOutlet) {
    url.searchParams.set('outlet', state.selectedOutlet);
  } else {
    url.searchParams.delete('outlet');
  }

  if (state.selectedCategory) {
    url.searchParams.set('cat', state.selectedCategory);
  } else {
    url.searchParams.delete('cat');
  }

  if (state.selectedStage) {
    url.searchParams.set('stage', state.selectedStage);
  } else {
    url.searchParams.delete('stage');
  }

  if (state.searchQuery) {
    url.searchParams.set('q', state.searchQuery);
  } else {
    url.searchParams.delete('q');
  }

  window.history.replaceState({}, '', url.toString());
}

const initialUrl = getUrlParams();

export const useDashboardStore = create<DashboardState>((set, get) => ({
  candidates: [],
  gateCandidates: [],
  loading: true,
  error: null,
  lastUpdated: null,
  fileName: 'data_kandidat(1).xlsx',

  activePage: initialUrl.page || 'kandidat',
  activeTab: initialUrl.tab || 'cockpit',
  sidebarCollapsed: false,
  darkMode: false,
  maskPii: false,

  datePreset: initialUrl.preset || 'all',
  startDate: null,
  endDate: null,
  selectedPosition: initialUrl.pos || null,
  selectedOutlet: initialUrl.outlet || null,
  selectedCategory: initialUrl.cat || null,
  selectedStage: initialUrl.stage || null,
  searchQuery: initialUrl.q || '',
  crossFilter: null,

  selectedCandidateId: null,
  selectedGateCandidateId: null,
  compareCandidateIds: [],
  commandPaletteOpen: false,
  kanbanHistory: [],
  toasts: [],

  initializeData: async () => {
    set({ loading: true, error: null });
    try {
      const data = await loadDefaultExcel();
      set({
        candidates: data.candidates,
        gateCandidates: data.gateCandidates,
        lastUpdated: data.lastUpdated,
        fileName: data.fileName,
        loading: false,
      });
      get().addToast(`Data berhasil dimuat (${data.candidates.length} kandidat, ${data.gateCandidates.length} gate).`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membaca data Excel.';
      set({ error: msg, loading: false });
      get().addToast(msg, 'error');
    }
  },

  uploadExcel: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const data = await parseUploadedExcel(file);
      set({
        candidates: data.candidates,
        gateCandidates: data.gateCandidates,
        lastUpdated: data.lastUpdated,
        fileName: file.name,
        loading: false,
      });
      get().addToast(`File "${file.name}" berhasil diunggah (${data.candidates.length} kandidat).`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses file Excel yang diunggah.';
      set({ error: msg, loading: false });
      get().addToast(msg, 'error');
    }
  },

  setActivePage: (page) => {
    set({ activePage: page, crossFilter: null });
    syncUrlWithState({ ...get(), activePage: page });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    syncUrlWithState({ ...get(), activeTab: tab });
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleMaskPii: () => {
    const next = !get().maskPii;
    set({ maskPii: next });
    get().addToast(next ? 'Data sensitif disamarkan' : 'Data sensitif ditampilkan penuh', 'info');
  },

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  setDatePreset: (preset) => {
    set({ datePreset: preset });
    syncUrlWithState({ ...get(), datePreset: preset });
  },

  setDateRange: (start, end) => set({ startDate: start, endDate: end }),

  setSelectedPosition: (pos) => {
    set({ selectedPosition: pos });
    syncUrlWithState({ ...get(), selectedPosition: pos });
  },

  setSelectedOutlet: (outlet) => {
    set({ selectedOutlet: outlet });
    syncUrlWithState({ ...get(), selectedOutlet: outlet });
  },

  setSelectedCategory: (cat) => {
    set({ selectedCategory: cat });
    syncUrlWithState({ ...get(), selectedCategory: cat });
  },

  setSelectedStage: (stage) => {
    set({ selectedStage: stage });
    syncUrlWithState({ ...get(), selectedStage: stage });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    syncUrlWithState({ ...get(), searchQuery: query });
  },

  setCrossFilter: (filter) => set({ crossFilter: filter }),

  toggleCrossFilter: (filter) => {
    const current = get().crossFilter;
    if (current && current.key === filter.key && current.value === filter.value) {
      // Toggle off
      set({ crossFilter: null });
    } else {
      set({ crossFilter: filter });
    }
  },

  resetAllFilters: () => {
    set({
      datePreset: 'all',
      startDate: null,
      endDate: null,
      selectedPosition: null,
      selectedOutlet: null,
      selectedCategory: null,
      selectedStage: null,
      searchQuery: '',
      crossFilter: null,
    });
    syncUrlWithState({
      datePreset: 'all',
      selectedPosition: null,
      selectedOutlet: null,
      selectedCategory: null,
      selectedStage: null,
      searchQuery: '',
    });
    get().addToast('Semua filter telah direset', 'info');
  },

  setSelectedCandidateId: (id) => set({ selectedCandidateId: id }),
  setSelectedGateCandidateId: (id) => set({ selectedGateCandidateId: id }),

  toggleCompareCandidate: (id) => {
    const cur = get().compareCandidateIds;
    if (cur.includes(id)) {
      set({ compareCandidateIds: cur.filter(x => x !== id) });
    } else {
      if (cur.length >= 3) {
        get().addToast('Maksimal 3 kandidat untuk dibandingkan', 'warning');
        return;
      }
      set({ compareCandidateIds: [...cur, id] });
      get().addToast('Ditambahkan ke perbandingan', 'info');
    }
  },

  clearCompareCandidates: () => set({ compareCandidateIds: [] }),

  moveCandidateStage: (candidateId, newStage) => {
    const candidates = get().candidates;
    const target = candidates.find(c => c.id === candidateId);
    if (!target) return;

    const oldStage = target.status_screening_candidate;
    if (oldStage === newStage) return;

    // Update candidate
    const updated = candidates.map(c =>
      c.id === candidateId ? { ...c, status_screening_candidate: newStage } : c
    );

    // Record history
    const historyItem: KanbanHistoryItem = {
      candidateId,
      previousStage: oldStage,
      newStage,
      candidateName: target.candidate_name,
    };

    set({
      candidates: updated,
      kanbanHistory: [historyItem, ...get().kanbanHistory],
    });

    get().addToast(
      `${target.candidate_name} dipindah ke "${newStage}".`,
      'success',
      () => get().undoLastStageMove()
    );
  },

  undoLastStageMove: () => {
    const history = get().kanbanHistory;
    if (history.length === 0) return;

    const [lastAction, ...remaining] = history;
    const candidates = get().candidates;

    const updated = candidates.map(c =>
      c.id === lastAction.candidateId
        ? { ...c, status_screening_candidate: lastAction.previousStage }
        : c
    );

    set({
      candidates: updated,
      kanbanHistory: remaining,
    });

    get().addToast(
      `Perubahan tahap ${lastAction.candidateName} dibatalkan (kembali ke ${lastAction.previousStage}).`,
      'info'
    );
  },

  addToast: (message, type = 'info', undoAction) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, message, type, undoAction };
    set({ toasts: [...get().toasts, newToast] });

    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },
}));
