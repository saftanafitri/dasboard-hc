# Dashboard Human Capital (PIC Rekrutmen)

Dashboard rekrutmen interaktif berbasis web untuk tim **Human Capital (HC)** yang dirancang untuk memantau pipeline pelamar kerja, jadwal interview, serta hasil dan evaluasi gate seleksi langsung dari data Excel (`data_kandidat(1).xlsx`).

---

## 🚀 Fitur Utama

### 1. Halaman "Kandidat Lengkap"
- **KPI Cards Interaktif**:
  - Total Pelamar, Lolos (Hijau), Lolos Sebagian (Oranye), Dalam Proses (Biru), Rata-rata Skor Screening, dan Jadwal Interview Minggu Ini.
  - Klik kartu KPI untuk menerapkan filter cross-filtering instan.
- **Tampilan 3 Tab Beranimasi**:
  1. **Analitik & Grafik**:
     - Funnel Tahapan Rekrutmen + angka rasio konversi (%)
     - Bar Pelamar per Posisi (label terpotong rapi dengan tooltip lengkap)
     - 4 Donut chart: Sumber Informasi, Gender, Status Pernikahan, Kategori Lowongan
     - Bar Tingkat Pendidikan & Bar Pengalaman F&B urut logis
     - Bar Domisili Kota (Top 8 + toggle tampilkan semua kota)
     - Area Chart Tren Pelamar Harian dengan zoom/brush
     - Histogram Distribusi Usia (17–20, 21–25, 26–30, 31–35, 36+)
     - Bar Ekspektasi Gaji per Posisi (format Rp 2,2 jt) + toggle Rata-rata / Median
     - Tiap kartu grafik memiliki switch tampilan (Bar ↔ Donut ↔ Tabel) dan tombol unduh gambar PNG.
  2. **Pipeline Kanban**:
     - Kolom per tahap: *Qualified Applicants → Tahap Psikotes → Wawancara HC Group → Wawancara HC Deep → Wawancara User*.
     - Drag & drop kartu antar kolom untuk memperbarui status lokal dengan toast notifikasi & tombol **Undo**.
  3. **Kalender Interview**:
     - Tampilan kalender bulanan dan daftar agenda terperinci.
     - Klik agenda untuk membuka drawer kandidat dan tautan langsung ke Google Maps lokasi interview.
- **Tabel Data Kandidat**:
  - Real-time search, multi-column sorting, pagination (10/25/50), seleksi kolom visibilitas, multi-select baris dengan export CSV, dan sorotan kata kunci pencarian.
  - Klik baris membuka drawer detail lengkap kandidat (riwayat tahap, jadwal wawancara, dokumen CV & foto tanpa render base64 mentah).
  - Fitur **Bandingkan Kandidat**: pilih 2–3 kandidat untuk perbandingan metrik berdampingan (side-by-side).

### 2. Halaman "Gate Seleksi"
- **KPI Cards**: Total record tersaring, kandidat unik terkena, posisi terdampak, alasan terbanyak, dan rasio tersaring dibanding total pelamar.
- **Grafik Interaktif**:
  - Bar Alasan Tersaring (label human-readable Bahasa Indonesia)
  - Bar Horizontal Tersaring per Posisi
  - Donut Kategori Posisi (Outlet vs Office)
  - Bar Tersaring per Step Gate (Step 1, 2, 3)
  - Area Chart Tren Penolakan Harian
  - **Heatmap Interaktif**: Matriks Posisi × Alasan Tersaring (klik sel untuk memfilter)
  - Tabel 10 Jawaban Paling Sering Menyebabkan Gagal
- **Tabel Detail Gate**:
  - Kolom lengkap dengan filter, search, sort, pagination, export CSV, dan toggle **Dedupe per Email + Field**.

### 3. Interaktivitas & Utilitas Global
- **Zustand Global State & Cross-filtering**: Klik irisan/batang di grafik atau KPI mana pun untuk cross-filter seluruh dashboard.
- **Sticky Filter Bar**: Preset tanggal (Hari Ini, 7 Hari, 30 Hari, Semua), dropdown Posisi, Outlet, Kategori, dan Tahap.
- **URL Query Sync**: Filter tersimpan otomatis di URL query string agar dapat di-share.
- **Command Palette (`Ctrl/Cmd + K`)**: Navigasi cepat, cari kandidat, dan reset filter.
- **Keyboard Shortcuts**: `/` untuk fokus pencarian, `Esc` untuk menutup drawer/modal, `←` `→` untuk navigasi antar kandidat di drawer.
- **Privasi Data (PII Masking)**: Toggle "Sembunyikan data pribadi" untuk menyamarkan sebagian nomor WhatsApp dan email.
- **Mode Gelap (Dark Mode)**: Warna turunan palet hijau tua hutan yang nyaman di mata.
- **Drag & Drop Upload Excel**: Tarik file Excel (`.xlsx`, `.xls`) ke jendela browser untuk memuat atau memperbarui data secara langsung di browser tanpa backend.

---

## 🎨 Palet Warna Resmi

| Variabel CSS | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| `--green-900` | `#05473A` | Sidebar, header kartu |
| `--green-700` | `#0B5D48` | Menu aktif / hover |
| `--green-500` | `#1F7A5C` | Badge "HC", bubble avatar |
| `--green-300` | `#3E8F74` | Aksen muted |
| `--bg-page` | `#F1F5F2` | Background konten |
| `--surface` | `#FFFFFF` | Background kartu / modal |
| `--text-heading` | `#04281F` | Judul teks utama |
| `--text-muted` | `#4B6358` | Teks sekunder / muted |
| `--border` | `#E3EAE6` | Garis pembatas |
| `--accent-orange` | `#FF5A1F` | CTA, tombol Keluar, highlight |
| `--stat-blue` | `#1D4ED8` | Metrik "Dalam Proses" |
| `--stat-green` | `#059669` | Metrik "Lolos Seleksi" |
| `--stat-orange` | `#F59E0B` | Metrik "Pending / Lolos Sebagian" |
| `--stat-dark` | `#0B1F18` | Metrik "Total Pelamar" |

*Urutan warna grafik*: `#05473A`, `#1F7A5C`, `#FF5A1F`, `#F59E0B`, `#1D4ED8`, `#3E8F74`.

---

## 💻 Cara Menjalankan Project

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Server Pengembangan (Dev Server)
```bash
npm run dev
```
Akses dashboard di browser melalui alamat yang tertera (biasanya `http://localhost:5173`).

### 3. Build Bundel Produksi
```bash
npm run build
```

---

## 📂 Struktur Direktori

```text
/src
├── /components
│   ├── /gate               # Komponen khusus Gate Seleksi (KPI, Grafik, Tabel, Drawer)
│   ├── /kandidat           # Komponen khusus Kandidat Lengkap (KPI, Analytics, Kanban, Calendar, Table, Drawer, Compare)
│   ├── ChartCard.tsx       # Kontainer kartu grafik dengan switch mode (bar/donut/tabel) & PNG download
│   ├── CommandPalette.tsx  # Command palette (Ctrl+K)
│   ├── GlobalFilterBar.tsx # Filter bar sticky dengan chip & query sync
│   ├── KPICard.tsx         # Kartu metrik beranimasi count-up
│   ├── Sidebar.tsx         # Navigasi kiri collapsible & tombol keluar
│   └── ToastContainer.tsx  # Notifikasi toast dengan fitur Undo
├── /hooks
│   └── useFilteredData.ts  # Memoized hook filter kandidat dan gate
├── /lib
│   ├── excelParser.ts      # Parser SheetJS untuk Sheet 1 & Sheet 2
│   └── transformers.ts     # Format rupiah, WIB date, masking PII, label
├── /pages
│   ├── KandidatPage.tsx    # Halaman utama Kandidat Lengkap
│   └── GatePage.tsx        # Halaman utama Gate Seleksi
├── /store
│   └── useDashboardStore.ts# Zustand global store untuk data, filter, URL sync & history
├── /theme
│   └── colors.ts           # Konstanta palet warna & urutan warna grafik
├── App.tsx
├── index.css
└── main.tsx
```
