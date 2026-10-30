export interface Candidate {
  id: string;
  created_at: string;
  created_at_formatted: string;
  candidate_name: string;
  position_placement: string;
  position_clean: string;
  outlet_clean: string;
  screening_status: 'Lolos' | 'Lolos Sebagian' | string;
  screening_score: number;
  candidate_age: number;
  candidate_education: string;
  candidate_experience_years: number;
  candidate_experience_field: string;
  candidate_domicile: string;
  domisili_kota: string;
  domisili_provinsi: string;
  email: string;
  no_wa: string;
  gaji_ekspetasi: string;
  gaji_ekspetasi_num: number;
  gaji_terakhir: string;
  gaji_terakhir_num: number;
  gender: string;
  instagram: string;
  institusi: string;
  jurusan: string;
  kategori_lowongan: string;
  latar_belakang_pengalaman: string;
  pekerjaan_terakhir: string;
  pengalaman_fnb: string;
  pengalaman_tahun: number;
  recruitment_status: string;
  status_marital: string;
  sumber_info: string;
  status_screening_candidate: string;
  interview_date: string | null;
  interview_time: string | null;
  interview_location_name: string | null;
  interview_location_link: string | null;
  uploaded_files_cv_name: string | null;
  uploaded_files_cv_size: string | null;
  uploaded_files_cv_type: string | null;
  uploaded_files_foto_name: string | null;
  uploaded_files_foto_size: string | null;
  uploaded_files_foto_type: string | null;
  agama?: string;
  screening_total_criteria?: number;
  screening_passed_criteria?: number;
}

export interface GateCandidate {
  id: string;
  created_at: string;
  created_at_formatted: string;
  user_name: string;
  user_email: string;
  position_name: string;
  position_clean: string;
  outlet_clean: string;
  position_category: string;
  step_number: string;
  field_name: string;
  field_name_label: string;
  field_value: string;
  aturan_gate_tipe: string;
  syarat_lolos_gate: string;
  gate_config_id: string;
  ptk_id: string;
}

export interface GlobalFilterState {
  datePreset: 'all' | 'today' | '7days' | '30days';
  startDate: string | null;
  endDate: string | null;
  position: string | null;
  outlet: string | null;
  category: string | null;
  stage: string | null;
  // Cross-filtering active state
  crossFilter: {
    source: string | null;
    key: string | null;
    value: string | null;
  } | null;
  searchQuery: string;
}

export type PageView = 'kandidat' | 'gate';
export type ViewTab = 'cockpit' | 'analitik';
