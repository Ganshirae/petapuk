# PetaPuk (Platform Keterbukaan Publik Pupuk Bersubsidi)

PetaPuk merupakan platform berbasis web yang bertujuan meningkatkan transparansi dan pengawasan publik terhadap distribusi pupuk bersubsidi di Indonesia. Platform ini menyediakan informasi alokasi dan realisasi pupuk, Harga Eceran Tertinggi (HET), serta fasilitas pelaporan masyarakat tanpa memerlukan akun maupun NIK. Untuk keperluan lomba, implementasi data difokuskan pada 10 kabupaten/kota di Nusa Tenggara Barat (NTB).

---

## Fitur Utama

- **PetaData:** Menampilkan informasi umum, ringkasan data distribusi pupuk bersubsidi, dan akses menuju fitur utama platform.
- **Data Alokasi dan Realisasi:** Menyajikan informasi jumlah alokasi dan realisasi pupuk bersubsidi berdasarkan data resmi sebagai bentuk keterbukaan informasi publik.
- **Informasi HET:** Menampilkan Harga Eceran Tertinggi pupuk bersubsidi sebagai referensi masyarakat dalam memantau kesesuaian harga.
- **Laporan Masyarakat:** Memungkinkan masyarakat menyampaikan pengaduan terkait distribusi pupuk bersubsidi tanpa registrasi akun maupun NIK.
- **Lacak Laporan:** Memungkinkan pelapor memantau perkembangan dan status penanganan laporan menggunakan identitas atau kode pelacakan laporan.
- **Konfirmasi Penyelesaian (*Two-Sided Resolution*):** Laporan hanya dinyatakan selesai setelah penanganan dikonfirmasi oleh pelapor, sehingga penyelesaian tidak hanya bergantung pada pihak yang menerima laporan.

---

## Tabel Mapping Struktur Website

| No. | Halaman | Isi / Fungsi |
| :---: | :--- | :--- |
| **1** | **PetaData (Homepage)** | Menampilkan ringkasan informasi pupuk bersubsidi berupa grafik, total alokasi dan realisasi distribusi, serta panduan singkat cara membuat laporan. |
| **2** | **Data Wilayah** | Menyajikan informasi alokasi dan realisasi pupuk bersubsidi secara lebih terperinci berdasarkan provinsi dan kabupaten/kota. Halaman ini terhubung dengan PetaData untuk melihat detail dari statistik yang ditampilkan. |
| **5** | **Buat Laporan** | Menyediakan formulir pengaduan bagi masyarakat untuk melaporkan dugaan permasalahan distribusi maupun harga pupuk bersubsidi. |
| **6** | **Cek Laporan** | Memungkinkan masyarakat memantau status dan perkembangan pengaduan menggunakan kode pelacakan yang diperoleh setelah mengirim laporan. |
| **8** | **Daftar Subsidi** | Menyediakan panduan persyaratan dan prosedur pendaftaran pupuk bersubsidi serta akses menuju portal resmi Kementerian Pertanian. |

---

## Panduan Color Palette PETAPUK

Palet warna PETAPUK menggunakan dominasi warna hijau untuk merepresentasikan pertumbuhan, pertanian, dan keberlanjutan. Warna pendukung digunakan untuk membangun kontras, memperjelas informasi, serta menjaga tampilan website tetap minimalis dan mudah dibaca.

### Daftar Warna dan Penggunaannya

| Nama Warna | Kode HEX | Penggunaan Utama |
| :--- | :---: | :--- |
| **Dark Green** | `#134118` | Warna utama untuk identitas PETAPUK, *heading*, navigasi, dan elemen penting. |
| **Primary Green** | `#288132` | Warna utama alternatif untuk tombol, tautan aktif, ikon, dan gradasi. |
| **Bright Green** | `#90FF4B` | Warna aksen untuk *highlight*, indikator, dan elemen yang perlu menarik perhatian. |
| **Light Green** | `#BEFB98` | Warna pendukung untuk latar elemen, kartu informasi, dan aksen sekunder. |
| **Soft Green** | `#B9E9B0` | Digunakan pada area pendukung, ilustrasi, dan elemen dekoratif. |
| **Black** | `#000000` | Warna teks utama, judul, dan ikon yang membutuhkan kontras tinggi. |
| **White** | `#FFFFFF` | Warna latar utama untuk menjaga tampilan bersih dan memberikan ruang visual. |
| **Pale Green** | `#E4EEE8` | Warna latar *section*, *dashboard*, tabel, dan area informasi. |
| **Pink Accent** | `#FF66A3` | Warna aksen khusus untuk notifikasi, penanda tertentu (misal: pupuk belum disalurkan), atau elemen pembeda. |
| **Light Gray** | `#E5E5E5` | Warna *border*, garis pemisah, latar tabel, dan elemen nonaktif. |

---

## Panduan Tipografi PETAPUK

PETAPUK menggunakan kombinasi font **Space Grotesk** sebagai tipografi utama dan **Poppins** sebagai tipografi pendukung untuk menciptakan tampilan website yang modern, minimalis, profesional, serta mudah dibaca.

### 1. Jenis Font

- **Space Grotesk (Primary Typeface):**  
  Digunakan sebagai font utama untuk sebagian besar elemen website, seperti *heading*, paragraf, navigasi, deskripsi, dan informasi *dashboard*.
- **Poppins (Secondary Typeface):**  
  `ABCDEFGHIJKLMNOPQRSTUVWXYZ`  
  `abcdefghijklmnopqrstuvwxyz 0123456789`  
  Digunakan untuk memberikan penekanan pada bagian tertentu, seperti poin penting, label, angka statistik, dan informasi yang membutuhkan perhatian lebih.

### 2. Panduan Penggunaan Font

| Elemen | Font | Ketebalan (*Weight*) |
| :--- | :--- | :--- |
| **Heading utama** | Space Grotesk | Bold / Semibold |
| **Subheading** | Space Grotesk | Medium / Semibold |
| **Heading kartu** | Space Grotesk | Medium / Semibold |
| **Body text** | Space Grotesk | Regular |
| **Navigasi** | Space Grotesk | Medium |
| **Poin penting** | Poppins | Semibold / Bold |
| **Angka statistik** | Poppins | Bold |
| **Label dan badge** | Poppins | Medium / Semibold |

### 3. Rekomendasi Ukuran Tipografi

| Elemen | Ukuran (px) |
| :--- | :---: |
| **Heading utama** | 32–40 px |
| **Subheading** | 24–28 px |
| **Heading kartu** | 18–20 px |
| **Body text** | 14–16 px |
| **Label / Caption** | 12–14 px |
| **Angka statistik** | 24–32 px |

### 4. Prinsip Penerapan Tipografi

- **Konsistensi:** Space Grotesk menjadi font dominan di seluruh halaman PETAPUK.
- **Penekanan:** Poppins digunakan secara selektif untuk menonjolkan informasi penting.
- **Keterbacaan:** Hindari penggunaan terlalu banyak variasi ketebalan font dalam satu halaman.
- **Hierarki Visual:** Atur ukuran dan ketebalan font berdasarkan tingkat kepentingan informasi.

> *Space Grotesk membangun karakter visual utama PETAPUK, sedangkan Poppins berfungsi sebagai aksen tipografi untuk memperkuat penekanan informasi penting.*

---

## Visual Structure & UI Characteristics PETAPUK

Tampilan website PETAPUK mengusung konsep modern minimalis dengan pendekatan *dashboard* informatif. Desain berfokus pada penyajian data distribusi pupuk bersubsidi melalui visualisasi peta, grafik, ringkasan statistik, dan akses pelaporan yang mudah dijangkau pengguna.

### 1. Visual Structure (Struktur Tampilan)

- **A. Header & Navigation:**  
  Terletak di bagian atas website, terdiri dari logo PETAPUK dan menu navigasi utama. Navigasi menggunakan latar hijau tua dengan menu aktif berwarna hijau muda untuk menunjukkan posisi halaman pengguna.
- **B. Main Dashboard:**  
  Menjadi area utama penyajian informasi. Terdiri dari peta persebaran wilayah dan kartu ringkasan data yang menampilkan persentase distribusi, jumlah alokasi, serta jumlah pupuk yang telah dan belum disalurkan.
- **C. Data Visualization:**  
  Menampilkan grafik persentase distribusi tahunan untuk membantu pengguna memahami perbandingan data berdasarkan periode waktu secara visual.
- **D. Reporting Guide:**  
  Menyediakan panduan singkat mengenai cara menyampaikan laporan melalui tahapan menulis laporan, menyimpan kode pelacakan, dan memeriksa perkembangan laporan.
- **E. AI Assistant:**  
  Ditampilkan sebagai tombol mengambang (*floating button*) di sisi kanan *dashboard* agar mudah diakses tanpa mengganggu konten utama website.
- **F. Footer:**  
  Berisi identitas PETAPUK, deskripsi singkat fungsi platform, informasi privasi pengguna, serta identitas pengembang.

### 2. Karakteristik Tampilan UI

| Karakteristik | Penjelasan |
| :--- | :--- |
| **Minimalis** | Menggunakan elemen visual seperlunya agar informasi mudah dipahami. |
| **Dashboard-based** | Informasi utama disajikan dalam bentuk kartu, grafik, dan peta. |
| **Green-oriented** | Dominasi warna hijau merepresentasikan pertanian, pertumbuhan, dan keberlanjutan. |
| **Card-based layout** | Konten dikelompokkan dalam kartu dengan sudut membulat agar lebih terstruktur. |
| **Data-driven** | Mengutamakan visualisasi data untuk mempermudah pemahaman informasi distribusi. |
| **User-friendly** | Navigasi dan panduan pelaporan dirancang agar mudah ditemukan dan digunakan. |
| **Responsive elements**| Menggunakan komponen antarmuka yang dapat disesuaikan untuk kebutuhan tampilan berbagai perangkat. |

### 3. Prinsip Visual Design

- **Visual Hierarchy:** Informasi utama seperti persentase distribusi dan ringkasan data dibuat lebih menonjol melalui ukuran teks dan kontras warna.
- **Consistency:** Penggunaan warna, tipografi, ikon, dan bentuk komponen dibuat konsisten pada setiap bagian website.
- **White Space:** Penggunaan ruang kosong membantu memisahkan informasi dan menjaga tampilan agar tidak terlalu padat.
- **Accessibility:** Informasi penting disajikan melalui kombinasi teks, angka, ikon, dan warna, bukan hanya mengandalkan warna saja.
- **Ease of Navigation:** Menu utama ditempatkan pada bagian atas agar pengguna dapat berpindah halaman dengan mudah.

### 4. Deskripsi Keseluruhan UI

PETAPUK menerapkan desain antarmuka berbasis *dashboard* dengan pendekatan modern minimalis. Tampilan didominasi kombinasi warna hijau yang dipadukan dengan warna putih dan abu-abu sebagai penyeimbang. Informasi disusun menggunakan sistem *card-based layout* yang mengintegrasikan peta wilayah, ringkasan statistik, grafik distribusi, serta panduan pelaporan. Selain itu, fitur AI Assistant ditempatkan dalam bentuk *floating button* untuk memberikan akses bantuan secara praktis. Secara keseluruhan, desain UI PETAPUK mengutamakan keterbacaan informasi, konsistensi visual, dan kemudahan navigasi bagi pengguna.

---

## Alur Navigasi & Keterhubungan Antarhalaman

Website PETAPUK dirancang sebagai platform keterbukaan informasi publik yang berfokus pada transparansi data alokasi dan realisasi pupuk bersubsidi serta penyediaan sarana pelaporan masyarakat. Desain antarmuka mengusung konsep modern minimalis dengan pendekatan *dashboard-based layout*, sehingga informasi dapat disajikan secara terstruktur, ringkas, dan mudah dipahami oleh pengguna.

Dari segi visual, PETAPUK menggunakan dominasi warna hijau sebagai identitas utama yang merepresentasikan pertanian, pertumbuhan, dan keberlanjutan. Kombinasi warna hijau tua `#134118` dan `#288132` digunakan sebagai warna utama, didukung warna hijau cerah, hijau pastel, putih, dan abu-abu untuk menciptakan keseimbangan visual. Warna *pink* `#FF66A3` digunakan sebagai aksen untuk membedakan informasi tertentu, seperti data pupuk yang belum disalurkan. Pada aspek tipografi, Space Grotesk digunakan sebagai font utama untuk menjaga keterbacaan dan konsistensi tampilan, sedangkan Poppins digunakan sebagai font pendukung untuk memberikan penekanan pada informasi penting.

### Integrasi 5 Halaman Utama

1. **PetaData (Homepage):** Berfungsi sebagai halaman utama yang menyajikan gambaran umum informasi pupuk bersubsidi melalui peta persebaran wilayah, ringkasan statistik, grafik distribusi, dan panduan pelaporan.
2. **Data Wilayah:** Menjadi halaman lanjutan dari PetaData. Ketika pengguna ingin mengetahui informasi secara lebih terperinci, pengguna dapat membuka halaman ini untuk melihat data alokasi dan realisasi berdasarkan provinsi maupun kabupaten/kota.
3. **Buat Laporan:** Menyediakan sarana bagi masyarakat untuk menyampaikan pengaduan terkait dugaan permasalahan distribusi atau harga pupuk bersubsidi. Setelah laporan dikirim, pengguna memperoleh kode pelacakan yang digunakan untuk memantau perkembangan laporan.
4. **Cek Laporan:** Terhubung langsung dengan proses pelaporan melalui kode pelacakan yang diperoleh dari halaman Buat Laporan. Pengguna dapat mengetahui status laporan dan memberikan konfirmasi apabila laporan telah ditangani.
5. **Daftar Subsidi:** Menyediakan informasi mengenai persyaratan dan prosedur memperoleh pupuk bersubsidi, termasuk panduan melalui kelompok tani, PPL/BPP, serta tautan menuju portal resmi Kementerian Pertanian.

### Alur Partisipasi Pengguna

```
[ PetaData ] ───> [ Data Wilayah ]
      │
      └───> [ Buat Laporan ] ───> [ Simpan Kode ] ───> [ Cek Laporan ] ───> [ Konfirmasi Selesai ]
      │
      └───> [ Daftar Subsidi ] (Prosedur & Portal Kementan)
```

Keterkaitan antarahalaman tersebut membentuk alur informasi dan partisipasi masyarakat:
- Pengguna dapat memulai dengan melihat ringkasan informasi pada **PetaData**.
- Melanjutkan penelusuran detail melalui **Data Wilayah**.
- Apabila menemukan dugaan ketidaksesuaian, pengguna dapat memanfaatkan **Buat Laporan** dan memantau statusnya melalui **Cek Laporan**.
- **Daftar Subsidi** melengkapi kebutuhan informasi pengguna mengenai persyaratan dan prosedur memperoleh pupuk bersubsidi.

Selain itu, fitur **AI Assistant** ditempatkan dalam bentuk tombol mengambang (*floating button*) agar mudah diakses dari seluruh antarmuka website, sementara bagian **Footer** melengkapi tampilan dengan identitas platform, deskripsi singkat, dan informasi privasi pengguna.