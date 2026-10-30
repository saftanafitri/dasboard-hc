export const HC_COLORS = {
  green900: '#05473A',
  green700: '#0B5D48',
  green500: '#1F7A5C',
  green300: '#3E8F74',
  bgPage: '#F1F5F2',
  surface: '#FFFFFF',
  textHeading: '#04281F',
  textMuted: '#4B6358',
  border: '#E3EAE6',
  accentOrange: '#FF5A1F',
  statBlue: '#1D4ED8',
  statGreen: '#059669',
  statOrange: '#F59E0B',
  statDark: '#0B1F18',
};

// Urutan warna grafik: HANYA 4 warna utama (Hijau Tua, Hijau Emerald, Orange, Amber) & turunannya
export const CHART_COLORS = [
  '#05473A', // 1. Hijau Tua
  '#1F7A5C', // 2. Hijau Emerald
  '#FF5A1F', // 3. Orange
  '#F59E0B', // 4. Amber/Kuning Emas
  '#0B5D48', // 5. Turunan Hijau Deep
  '#3E8F74', // 6. Turunan Hijau Sage
  '#E04E17', // 7. Turunan Orange Terracotta
  '#FF7D4D', // 8. Turunan Orange Coral
  '#D97706', // 9. Turunan Amber Deep
  '#FBBF24', // 10. Turunan Amber Soft
  '#5DB89A', // 11. Turunan Hijau Mint
  '#072A22', // 12. Turunan Hijau Night
];

export const KANBAN_STAGES = [
  'Qualified Applicants',
  'Tahap Psikotes',
  'Wawancara HC Group',
  'Wawancara HC Deep',
  'Wawancara User',
] as const;

export type KanbanStage = typeof KANBAN_STAGES[number];
