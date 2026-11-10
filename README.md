# PEPUK: Platform Transparansi Pupuk Bersubsidi

> **Kompetisi:** MIA 2026 — Web In Action (WIA)
> **Tema:** *Designing Digital Futures: Powering Public Transparency*

---

## 1. Deskripsi Singkat

**PEPUK** adalah platform keterbukaan publik untuk distribusi pupuk bersubsidi. Isinya data alokasi dan realisasi resmi untuk 38 provinsi (Kementerian Pertanian) dan 10 kabupaten/kota NTB (Satu Data NTB), HET yang berlaku, serta kanal laporan warga tanpa akun dan tanpa NIK. Laporan baru dinyatakan selesai setelah dikonfirmasi pelapor (*two-sided resolution*).

PEPUK melengkapi, tidak menggantikan, sistem resmi (e-RDKK, i-Pubers, Cek Subsidi Kementan, SP4N-LAPOR!).

---

## 2. Fitur

| Fitur | Isi |
| :--- | :--- |
| **Dashboard** | Filter wilayah (nasional, 38 provinsi, 10 kab/kota NTB) dengan auto-zoom peta, tahun, dan jenis pupuk; KPI; peta choropleth interaktif; grafik tren, per jenis pupuk, dan peringkat wilayah; tabel wilayah; tabel HET dan kalkulator harga; statistik tindak lanjut laporan; kanal resmi; unduh CSV. Setiap angka disertai sumber. |
| **Lapor** | 7 kategori masalah, 4 langkah, tanpa akun/NIK; perbandingan otomatis dengan HET; maks. 3 foto (EXIF dihapus di browser); kontak opsional. Menghasilkan ID publik (`PP-2026-XXXXXX`) dan kode rahasia. |
| **Lacak** | Tahapan status, tenggat per tahap (PermenPANRB 62/2018), penanda terlambat, instansi penanggung jawab, riwayat, konfirmasi pelapor. |
| **Cek Hak Subsidi** | Cek kelayakan berdasarkan Permentan 15/2025 jo. 3/2026 dan panduan daftar lewat penyuluh ke e-RDKK. Tidak menyimpan data. |
| **Panel Petugas** | `/#petugas`: login, antrian laporan, ubah status dengan catatan publik. |

---

## 3. Tech Stack

* **Frontend:** React 18 + Vite 6, Tailwind CSS 3, Leaflet 1.9, Lucide React
* **Backend:** Supabase (PostgreSQL, Auth, Storage). Publik tidak mengakses tabel laporan secara langsung; semua lewat fungsi RPC dengan validasi, kode rahasia disimpan sebagai hash bcrypt, dan pelacakan dibatasi 5 percobaan/menit.
* **Peta:** GeoJSON 38 provinsi (ardian28/GeoJson-Indonesia-38-Provinsi, MIT) dan batas kab/kota NTB.

---

## 4. Menjalankan Proyek

### Prasyarat
* Node.js 18 atau lebih baru (dibutuhkan Vite 6)
* Python 3 (hanya pustaka standar, untuk skrip seed)
* Project Supabase

```bash
git clone https://github.com/Ganshirae/pepuk.git
cd pepuk
npm install
cp .env.example .env   # isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY (publishable key)
npm run dev            # http://localhost:5173/
```

Build produksi: `npm run build && npm run preview`.

### Database
1. **Skema:** jalankan `supabase/migrations/0001` sampai `0008` secara berurutan (SQL Editor Supabase atau `psql`).
2. **Data referensi:** isi `SUPABASE_DB_URL` di `.env` (Session pooler, jangan diberi awalan `VITE_`), lalu:
   ```bash
   set -a; . ./.env; set +a
   python3 scripts/seed_reference.py | psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1
   ```
   Skrip memvalidasi jumlah per provinsi terhadap baris total di berkas sumber. Berkas mentah ada di `data/raw/`.
3. **Akun petugas:** buat user di Supabase → Authentication → Add user, lalu daftarkan di SQL Editor:
   ```sql
   insert into public.officers (user_id, name, agency, role)
   values ('<user-id>', 'Nama Petugas', 'Dinas Pertanian Kab. ...', 'verifikator'); -- role: verifikator | admin
   ```
   Panel petugas dibuka di `/#petugas`. Gunakan kata sandi yang kuat karena akun ini dapat membaca kontak pelapor.

---

## 5. Sumber Data & Regulasi

1. **Alokasi & realisasi nasional:** Satu Data Pertanian, Kementan (Ditjen PSP, diolah dari PT Pupuk Indonesia), Data Prioritas 2025, rilis 31 Des 2025. Per provinsi, 2019–2025:
   * Urea dan NPK: 2019–2025.
   * ZA: tidak ada data 2023–2024. Organik: tidak ada data 2023. SP-36: hanya sampai 2022.
   * Data 2025 sampai Oktober 2025; realisasi ZA, Organik, dan SP-36 tahun 2022 sampai September 2022.
   * Urea 2025: jumlah per provinsi di berkas sumber lebih besar dari baris total Indonesia (alokasi +10.076 t, realisasi +3.166 t). Ditampilkan apa adanya dan dicatat di metadata sumber.
2. **Alokasi & realisasi NTB:** Satu Data NTB, per kabupaten/kota, 2021–2025, semua jenis pupuk.
3. **HET:** Kepmentan No. 1117/Kpts./SR.310/M/10/2025, berlaku 22 Okt 2025 (Urea Rp1.800/kg, NPK Rp1.840/kg, NPK Formula Khusus Rp2.640/kg, ZA Rp1.360/kg, Organik Rp640/kg).
4. **Syarat penerima:** Perpres 6/2025, Permentan 15/2025 jo. Permentan 3/2026.
5. **Tenggat pengaduan:** PermenPANRB 62/2018.
6. **Peta:** batas provinsi dari [ardian28/GeoJson-Indonesia-38-Provinsi](https://github.com/ardian28/GeoJson-Indonesia-38-Provinsi) (MIT, disederhanakan); peta dasar © kontributor [OpenStreetMap](https://www.openstreetmap.org/copyright).

---

## 6. Batasan

* Data bersifat tahunan dan bergantung pada rilis resmi; bukan data waktu nyata.
* Data kab/kota baru tersedia untuk NTB. Laporan dari provinsi lain mencatat nama kab/kota sebagai teks.
* Tidak ada API publik e-RDKK maupun Cek Subsidi, sehingga fitur Cek Hak Subsidi berupa panduan dan tautan ke situs resmi, bukan pendaftaran langsung.
* Perhitungan hari kerja mengecualikan Sabtu–Minggu, tetapi belum memperhitungkan libur nasional.
* Kode rahasia laporan tidak dapat dipulihkan jika hilang (server hanya menyimpan hash-nya).
