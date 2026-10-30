// Utility transformers and formatters

const MONTH_NAMES_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Konversi ISO UTC date ke format WIB (Asia/Jakarta): "29 Okt 2026, 09:49"
 */
export function formatWibDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return String(dateInput);

    // Format in UTC+7 (Asia/Jakarta)
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const wibTime = new Date(utc + (7 * 3600000));

    const day = wibTime.getDate().toString().padStart(2, '0');
    const month = MONTH_NAMES_ID[wibTime.getMonth()];
    const year = wibTime.getFullYear();
    const hours = wibTime.getHours().toString().padStart(2, '0');
    const mins = wibTime.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${mins}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Parse string mata uang seperti "2.222.222" atau "Rp 2.000.000" menjadi angka numerik murni
 */
export function parseCurrency(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format angka ke format pendek: Rp 2,2 jt / Rp 850 rb
 */
export function formatCurrencyShort(val: number): string {
  if (!val || val === 0) return 'Rp 0';
  if (val >= 1_000_000) {
    const jt = val / 1_000_000;
    const formatted = jt % 1 === 0 ? jt.toFixed(0) : jt.toFixed(1).replace('.', ',');
    return `Rp ${formatted} jt`;
  }
  if (val >= 1_000) {
    const rb = val / 1_000;
    const formatted = rb % 1 === 0 ? rb.toFixed(0) : rb.toFixed(0);
    return `Rp ${formatted} rb`;
  }
  return `Rp ${val}`;
}

/**
 * Format angka ke mata uang Rupiah lengkap: Rp 2.222.222
 */
export function formatCurrencyFull(val: number): string {
  if (!val && val !== 0) return '-';
  return 'Rp ' + Math.round(val).toLocaleString('id-ID');
}

/**
 * Pecah "Posisi (Outlet)" menjadi posisi dan outlet terpisah
 */
export function extractPositionAndOutlet(
  rawPosition: string | null | undefined,
  penempatan?: string | null | undefined
): { position: string; outlet: string } {
  if (!rawPosition) return { position: '-', outlet: '-' };

  const raw = String(rawPosition).trim();

  // If explicit penempatan exists
  if (penempatan && penempatan.trim()) {
    const cleanOutlet = penempatan.trim();
    // Try to strip penempatan from raw if wrapped in parens
    const cleanPos = raw
      .replace(new RegExp(`\\s*\\(${escapeRegExp(cleanOutlet)}\\)\\s*$`, 'i'), '')
      .trim();
    return {
      position: cleanPos || raw,
      outlet: cleanOutlet
    };
  }

  // Look for last set of parenthesis e.g. "Crew Kitchen (Bartender) (Bakso Sedjahtera Mekarwangi)"
  const match = raw.match(/^(.*?)(?:\s*\(([^()]+)\))$/);
  if (match && match[1] && match[2]) {
    // If the matched inner text looks like an outlet name (e.g. contains Bakso, Outlet, Cabang, etc.)
    const inner = match[2].trim();
    const pos = match[1].trim();
    if (
      inner.toLowerCase().includes('bakso') ||
      inner.toLowerCase().includes('outlet') ||
      inner.toLowerCase().includes('cabang') ||
      inner.toLowerCase().includes('seblak') ||
      inner.toLowerCase().includes('cirebon') ||
      inner.toLowerCase().includes('bandung') ||
      inner.toLowerCase().includes('mekarwangi') ||
      inner.toLowerCase().includes('sarijadi')
    ) {
      return { position: pos, outlet: inner };
    }
  }

  return { position: raw, outlet: 'Head Office / Umum' };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Samarkan nomor WhatsApp: 0859106953807 -> 0859****3807
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '-';
  const clean = String(phone).trim();
  if (clean.length <= 7) return clean;
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-4);
  return `${prefix}****${suffix}`;
}

/**
 * Samarkan alamat Email: aquilaputrar@gmail.com -> aq***@gmail.com
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '-';
  const clean = String(email).trim();
  const parts = clean.split('@');
  if (parts.length !== 2) return clean;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) {
    return `${name[0] || ''}***@${domain}`;
  }
  return `${name.slice(0, 2)}***@${domain}`;
}

/**
 * Human-readable mapping untuk field_name di sheet Gate Seleksi
 */
export const FIELD_NAME_LABELS: Record<string, string> = {
  latar_belakang_pengalaman: 'Latar Belakang Pengalaman',
  domisili_kota: 'Domisili Kota',
  pengalaman_fnb: 'Pengalaman F&B',
  bidang_pekerjaan: 'Bidang Pekerjaan',
  agama: 'Agama',
  domisili_provinsi: 'Domisili Provinsi',
  gaji_ekspetasi: 'Ekspektasi Gaji',
  pendidikan: 'Pendidikan',
  gender: 'Jenis Kelamin',
  pengalaman_tahun: 'Tahun Pengalaman',
  status_marital: 'Status Pernikahan',
};

export function humanizeFieldName(field: string | null | undefined): string {
  if (!field) return '-';
  const clean = String(field).trim();
  return FIELD_NAME_LABELS[clean] || clean.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Kelompok usia untuk histogram
 */
export function getAgeGroup(age: number): string {
  if (!age || age < 17) return '< 17';
  if (age <= 20) return '17–20 th';
  if (age <= 25) return '21–25 th';
  if (age <= 30) return '26–30 th';
  if (age <= 35) return '31–35 th';
  return '36+ th';
}

/**
 * Order berurutan logis untuk Pengalaman F&B
 */
export const FNB_EXPERIENCE_ORDER = [
  'Tidak ada pengalaman (Fresh Graduate)',
  'Di bawah 6 bulan',
  'Kurang dari 1 tahun',
  '1 - 2 tahun',
  'Lebih dari 2 tahun'
];
