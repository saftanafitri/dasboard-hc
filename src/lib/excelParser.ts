import * as XLSX from 'xlsx';
import { Candidate, GateCandidate } from '../types';
import {
  extractPositionAndOutlet,
  formatWibDate,
  humanizeFieldName,
  parseCurrency,
} from './transformers';

export interface ParsedDashboardData {
  candidates: Candidate[];
  gateCandidates: GateCandidate[];
  lastUpdated: Date;
  fileName: string;
}

export function parseExcelWorkbook(workbook: XLSX.WorkBook, fileName = 'data_kandidat(1).xlsx'): ParsedDashboardData {
  const sheetNames = workbook.SheetNames;
  
  // Sheet 1: Kandidat Lengkap
  const sheet1Name = sheetNames.find(s => s.toLowerCase().includes('lengkap')) || sheetNames[0];
  const sheet1 = sheet1Name ? workbook.Sheets[sheet1Name] : null;
  const rawCandidates = sheet1 ? (XLSX.utils.sheet_to_json(sheet1, { defval: null }) as Record<string, unknown>[]) : [];

  const candidates: Candidate[] = rawCandidates.map((row, idx) => {
    const rawPos = (row['position_placement'] || row['posisi'] || '-') as string;
    const penempatan = (row['penempatan'] || null) as string | null;
    const { position, outlet } = extractPositionAndOutlet(rawPos, penempatan);
    
    const rawScore = row['screening_score'];
    const score = typeof rawScore === 'number' ? rawScore : (parseInt(String(rawScore || '0'), 10) || 0);

    const rawAge = row['candidate_age'] || row['usia'];
    const age = typeof rawAge === 'number' ? rawAge : (parseInt(String(rawAge || '0'), 10) || 0);

    const rawExpYears = row['candidate_experience_years'] || row['pengalaman_tahun'];
    const expYears = typeof rawExpYears === 'number' ? rawExpYears : (parseInt(String(rawExpYears || '0'), 10) || 0);

    const gajiEksp = String(row['gaji_ekspetasi'] || '-');
    const gajiAkhir = String(row['gaji_terakhir'] || '-');

    const createdAt = String(row['created_at'] || '');
    const candidateName = String(row['candidate_name'] || row['nama'] || `Kandidat #${idx + 1}`);

    return {
      id: String(row['id'] || `cand-${idx + 1}`),
      created_at: createdAt,
      created_at_formatted: formatWibDate(createdAt),
      candidate_name: candidateName,
      position_placement: rawPos,
      position_clean: position,
      outlet_clean: outlet,
      screening_status: String(row['screening_status'] || '-'),
      screening_score: score,
      candidate_age: age,
      candidate_education: String(row['candidate_education'] || row['pendidikan'] || '-'),
      candidate_experience_years: expYears,
      candidate_experience_field: String(row['candidate_experience_field'] || row['bidang_pekerjaan'] || '-'),
      candidate_domicile: String(row['candidate_domicile'] || row['domisili'] || '-'),
      domisili_kota: String(row['domisili_kota'] || '-'),
      domisili_provinsi: String(row['domisili_provinsi'] || '-'),
      email: String(row['email'] || '-'),
      no_wa: String(row['no_wa'] || '-'),
      gaji_ekspetasi: gajiEksp,
      gaji_ekspetasi_num: parseCurrency(gajiEksp),
      gaji_terakhir: gajiAkhir,
      gaji_terakhir_num: parseCurrency(gajiAkhir),
      gender: String(row['gender'] || '-'),
      instagram: String(row['instagram'] || '-'),
      institusi: String(row['institusi'] || '-'),
      jurusan: String(row['jurusan'] || '-'),
      kategori_lowongan: String(row['kategori_lowongan'] || 'Outlet'),
      latar_belakang_pengalaman: String(row['latar_belakang_pengalaman'] || '-'),
      pekerjaan_terakhir: String(row['pekerjaan_terakhir'] || '-'),
      pengalaman_fnb: String(row['pengalaman_fnb'] || 'Belum ada data'),
      pengalaman_tahun: expYears,
      recruitment_status: String(row['recruitment_status'] || '-'),
      status_marital: String(row['status_marital'] || '-'),
      sumber_info: String(row['sumber_info'] || '-'),
      status_screening_candidate: String(row['status_screening_candidate'] || 'Qualified Applicants'),
      interview_date: row['interview_date'] ? String(row['interview_date']) : null,
      interview_time: row['interview_time'] ? String(row['interview_time']) : null,
      interview_location_name: row['interview_location_name'] ? String(row['interview_location_name']) : null,
      interview_location_link: row['interview_location_link'] ? String(row['interview_location_link']) : null,
      uploaded_files_cv_name: row['uploaded_files_cv_name'] ? String(row['uploaded_files_cv_name']) : null,
      uploaded_files_cv_size: row['uploaded_files_cv_size'] ? String(row['uploaded_files_cv_size']) : null,
      uploaded_files_cv_type: row['uploaded_files_cv_type'] ? String(row['uploaded_files_cv_type']) : null,
      uploaded_files_foto_name: row['uploaded_files_foto_name'] ? String(row['uploaded_files_foto_name']) : null,
      uploaded_files_foto_size: row['uploaded_files_foto_size'] ? String(row['uploaded_files_foto_size']) : null,
      uploaded_files_foto_type: row['uploaded_files_foto_type'] ? String(row['uploaded_files_foto_type']) : null,
      agama: row['agama'] ? String(row['agama']) : undefined,
      screening_total_criteria: row['screening_total_criteria'] ? Number(row['screening_total_criteria']) : undefined,
      screening_passed_criteria: row['screening_passed_criteria'] ? Number(row['screening_passed_criteria']) : undefined,
    };
  });

  // Sheet 2: Kandidat Terfilter Gate
  const sheet2Name = sheetNames.find(s => s.toLowerCase().includes('gate') || s.toLowerCase().includes('terfilter')) || sheetNames[1];
  const sheet2 = sheet2Name ? workbook.Sheets[sheet2Name] : null;
  const rawGate = sheet2 ? (XLSX.utils.sheet_to_json(sheet2, { defval: null }) as Record<string, unknown>[]) : [];

  const gateCandidates: GateCandidate[] = rawGate.map((row, idx) => {
    const rawPos = String(row['position_name'] || '-');
    const { position, outlet } = extractPositionAndOutlet(rawPos);
    const fieldName = String(row['field_name'] || '-');
    const createdAt = String(row['created_at'] || '');

    return {
      id: String(row['id'] || `gate-${idx + 1}`),
      created_at: createdAt,
      created_at_formatted: formatWibDate(createdAt),
      user_name: String(row['user_name'] || '-'),
      user_email: String(row['user_email'] || '-'),
      position_name: rawPos,
      position_clean: position,
      outlet_clean: outlet,
      position_category: String(row['position_category'] || 'Outlet'),
      step_number: String(row['step_number'] || '1'),
      field_name: fieldName,
      field_name_label: humanizeFieldName(fieldName),
      field_value: String(row['field_value'] !== null && row['field_value'] !== undefined ? row['field_value'] : 'Kosong'),
      aturan_gate_tipe: String(row['aturan_gate_tipe'] || 'must_match'),
      syarat_lolos_gate: String(row['syarat_lolos_gate'] || '-'),
      gate_config_id: String(row['gate_config_id'] || '-'),
      ptk_id: String(row['ptk_id'] || '-'),
    };
  });

  return {
    candidates,
    gateCandidates,
    lastUpdated: new Date(),
    fileName,
  };
}

export async function loadDefaultExcel(): Promise<ParsedDashboardData> {
  const tryPaths = [
    '/data_kandidat(1).xlsx',
    '/data_kandidat_1_.xlsx',
    './data_kandidat(1).xlsx'
  ];

  for (const p of tryPaths) {
    try {
      const response = await fetch(p);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        return parseExcelWorkbook(workbook, 'data_kandidat_1_.xlsx');
      }
    } catch {
      // try next path
    }
  }

  throw new Error('Gagal memuat file Excel default dari workspace.');
}

export async function parseUploadedExcel(file: File): Promise<ParsedDashboardData> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  return parseExcelWorkbook(workbook, file.name);
}
