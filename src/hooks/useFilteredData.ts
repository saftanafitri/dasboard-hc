import { useMemo } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import { getAgeGroup } from '../lib/transformers';

export function useFilteredData() {
  const candidates = useDashboardStore((s) => s.candidates);
  const gateCandidates = useDashboardStore((s) => s.gateCandidates);
  const datePreset = useDashboardStore((s) => s.datePreset);
  const startDate = useDashboardStore((s) => s.startDate);
  const endDate = useDashboardStore((s) => s.endDate);
  const selectedPosition = useDashboardStore((s) => s.selectedPosition);
  const selectedOutlet = useDashboardStore((s) => s.selectedOutlet);
  const selectedCategory = useDashboardStore((s) => s.selectedCategory);
  const selectedStage = useDashboardStore((s) => s.selectedStage);
  const searchQuery = useDashboardStore((s) => s.searchQuery);
  const crossFilter = useDashboardStore((s) => s.crossFilter);

  // Compute reference date: max created_at from data or current date
  const referenceDate = useMemo(() => {
    let maxTime = 0;
    for (const c of candidates) {
      if (c.created_at) {
        const t = new Date(c.created_at).getTime();
        if (t > maxTime) maxTime = t;
      }
    }
    // Fallback to now if no data
    return maxTime > 0 ? new Date(maxTime) : new Date();
  }, [candidates]);

  // Candidate filtering
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return candidates.filter((c) => {
      // 1. Date filter
      if (c.created_at && datePreset !== 'all') {
        const candDate = new Date(c.created_at);
        if (!isNaN(candDate.getTime())) {
          const diffDays = (referenceDate.getTime() - candDate.getTime()) / (1000 * 3600 * 24);

          if (datePreset === 'today' && diffDays > 1.5) {
            return false;
          }
          if (datePreset === '7days' && diffDays > 7.5) {
            return false;
          }
          if (datePreset === '30days' && diffDays > 30.5) {
            return false;
          }
        }
      }

      if (startDate && c.created_at) {
        if (new Date(c.created_at) < new Date(startDate)) return false;
      }
      if (endDate && c.created_at) {
        if (new Date(c.created_at) > new Date(endDate)) return false;
      }

      // 2. Position filter
      if (selectedPosition && selectedPosition !== 'Semua') {
        if (c.position_clean !== selectedPosition && c.position_placement !== selectedPosition) {
          return false;
        }
      }

      // 3. Outlet filter
      if (selectedOutlet && selectedOutlet !== 'Semua') {
        if (c.outlet_clean !== selectedOutlet) {
          return false;
        }
      }

      // 4. Category filter
      if (selectedCategory && selectedCategory !== 'Semua') {
        if (c.kategori_lowongan !== selectedCategory) {
          return false;
        }
      }

      // 5. Stage filter
      if (selectedStage && selectedStage !== 'Semua') {
        if (c.status_screening_candidate !== selectedStage) {
          return false;
        }
      }

        // 6. Cross-filter (from chart click or KPI click)
        if (crossFilter) {
          const { key, value } = crossFilter;
          if (key === 'screening_status' && c.screening_status !== value) return false;
          if (key === 'status_screening_candidate' && c.status_screening_candidate !== value) return false;
          if (key === 'in_process' && (!c.status_screening_candidate || c.status_screening_candidate === '-')) return false;
          if (key === 'has_interview' && !c.interview_date) return false;
          if (key === 'high_score' && (c.screening_score || 0) < 80) return false;
          if (key === 'position_clean' && c.position_clean !== value && c.position_placement !== value) return false;
          if (key === 'gender' && c.gender !== value) return false;
          if (key === 'status_marital' && c.status_marital !== value) return false;
          if (key === 'kategori_lowongan' && c.kategori_lowongan !== value) return false;
          if (key === 'sumber_info' && c.sumber_info !== value) return false;
          if (key === 'candidate_education' && c.candidate_education !== value) return false;
          if (key === 'pengalaman_fnb' && c.pengalaman_fnb !== value) return false;
          if (key === 'domisili_kota' && c.domisili_kota !== value) return false;
          if (key === 'age_group' && getAgeGroup(c.candidate_age) !== value) return false;
        }

      // 7. Search query
      if (q) {
        const matchName = c.candidate_name.toLowerCase().includes(q);
        const matchEmail = c.email.toLowerCase().includes(q);
        const matchPhone = c.no_wa.toLowerCase().includes(q);
        const matchPos = c.position_placement.toLowerCase().includes(q);
        const matchCity = c.domisili_kota.toLowerCase().includes(q);
        const matchInst = c.institusi.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchPos && !matchCity && !matchInst) {
          return false;
        }
      }

      return true;
    });
  }, [
    candidates,
    datePreset,
    startDate,
    endDate,
    referenceDate,
    selectedPosition,
    selectedOutlet,
    selectedCategory,
    selectedStage,
    crossFilter,
    searchQuery,
  ]);

  // Gate candidates filtering
  const filteredGateCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return gateCandidates.filter((g) => {
      // 1. Date filter
      if (g.created_at && datePreset !== 'all') {
        const gDate = new Date(g.created_at);
        if (!isNaN(gDate.getTime())) {
          const diffDays = (referenceDate.getTime() - gDate.getTime()) / (1000 * 3600 * 24);

          if (datePreset === 'today' && diffDays > 1.5) return false;
          if (datePreset === '7days' && diffDays > 7.5) return false;
          if (datePreset === '30days' && diffDays > 30.5) return false;
        }
      }

      // 2. Position filter
      if (selectedPosition && selectedPosition !== 'Semua') {
        if (g.position_clean !== selectedPosition && g.position_name !== selectedPosition) {
          return false;
        }
      }

      // 3. Outlet filter
      if (selectedOutlet && selectedOutlet !== 'Semua') {
        if (g.outlet_clean !== selectedOutlet) return false;
      }

      // 4. Category filter
      if (selectedCategory && selectedCategory !== 'Semua') {
        if (g.position_category !== selectedCategory) return false;
      }

      // 5. Cross filter
      if (crossFilter) {
        const { key, value } = crossFilter;
        if (key === 'field_name' && g.field_name !== value) return false;
        if (key === 'position_clean' && g.position_clean !== value && g.position_name !== value) return false;
        if (key === 'step_number' && String(g.step_number) !== String(value)) return false;
        if (key === 'position_category' && g.position_category !== value) return false;
        if (key === 'field_value' && g.field_value !== value) return false;
        if (key === 'has_email' && (!g.user_email || g.user_email === '-')) return false;
        if (key === 'has_position' && (!g.position_clean || g.position_clean === '-')) return false;
        if (key === 'gate_strict' && Number(g.step_number || 1) > 2) return false;
        if (key === 'heatmap_pos_field') {
          const [pos, fName] = value.split(':::');
          if (g.position_clean !== pos || g.field_name !== fName) return false;
        }
      }

      // 6. Search query
      if (q) {
        const matchName = g.user_name.toLowerCase().includes(q);
        const matchEmail = g.user_email.toLowerCase().includes(q);
        const matchPos = g.position_name.toLowerCase().includes(q);
        const matchField = g.field_name.toLowerCase().includes(q);
        const matchLabel = g.field_name_label.toLowerCase().includes(q);
        const matchValue = g.field_value.toLowerCase().includes(q);
        const matchSyarat = g.syarat_lolos_gate.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPos && !matchField && !matchLabel && !matchValue && !matchSyarat) {
          return false;
        }
      }

      return true;
    });
  }, [
    gateCandidates,
    datePreset,
    referenceDate,
    selectedPosition,
    selectedOutlet,
    selectedCategory,
    crossFilter,
    searchQuery,
  ]);

  // Options for filter dropdowns
  const filterOptions = useMemo(() => {
    const positions = new Set<string>();
    const outlets = new Set<string>();
    const categories = new Set<string>();
    const stages = new Set<string>();

    for (const c of candidates) {
      if (c.position_clean && c.position_clean !== '-') positions.add(c.position_clean);
      if (c.outlet_clean && c.outlet_clean !== '-') outlets.add(c.outlet_clean);
      if (c.kategori_lowongan) categories.add(c.kategori_lowongan);
      if (c.status_screening_candidate) stages.add(c.status_screening_candidate);
    }

    for (const g of gateCandidates) {
      if (g.position_clean && g.position_clean !== '-') positions.add(g.position_clean);
      if (g.outlet_clean && g.outlet_clean !== '-') outlets.add(g.outlet_clean);
      if (g.position_category) categories.add(g.position_category);
    }

    return {
      positions: Array.from(positions).sort(),
      outlets: Array.from(outlets).sort(),
      categories: Array.from(categories).sort(),
      stages: Array.from(stages).sort(),
    };
  }, [candidates, gateCandidates]);

  return {
    filteredCandidates,
    filteredGateCandidates,
    filterOptions,
    referenceDate,
  };
}
