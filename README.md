# AR'BON - Sistem Manajemen Keuangan

Sistem pencatatan dan laporan keuangan untuk perusahaan suku cadang carbon AR'BON.

## 🌟 Fitur Utama

### 🏠 Halaman Beranda (Dashboard)
- **Kartu Ringkasan** - Tampilan total pemasukan, pengeluaran, saldo, dan jumlah transaksi
- **Grafik Analisis** - Visualisasi pemasukan vs pengeluaran per bulan
- **Diagram Distribusi** - Grafik pie untuk distribusi pengeluaran berdasarkan kategori
- **Tabel Transaksi Terbaru** - Menampilkan 10 transaksi terakhir
- **Auto Refresh** - Tombol untuk memperbarui data secara manual
- **Optimisasi Kinerja** - Lazy loading dan caching untuk performa maksimal

### 📊 Halaman Laporan
- **Input Data Manual** - Form lengkap untuk menambah transaksi:
  - Tanggal
  - Nama transaksi
  - Deskripsi/keterangan
  - Kategori (Gaji, Uang Makan, Listrik, Belanja Produksi, Lainnya)
  - Tipe (Pemasukan/Pengeluaran)
  - Nominal biaya

- **Laporan Kategori Khusus**:
  - 💰 Laporan Gaji Pekerja
  - 🍽️ Laporan Uang Makan
  - ⚡ Laporan Listrik
  - 🏭 Laporan Belanja Produksi

- **Import Data** dari berbagai format:
  - CSV (✅ Aktif)
  - PDF (Dalam pengembangan)
  - Word/DOCX (Dalam pengembangan)
  - PowerPoint/PPTX (Dalam pengembangan)

- **Export Data** ke berbagai format:
  - CSV (✅ Aktif)
  - PDF (✅ Aktif)
  - Word/DOCX (Dalam pengembangan)
  - PowerPoint/PPTX (✅ Aktif)

- **Fitur Pencarian & Filter** - Cari transaksi berdasarkan nama atau deskripsi
- **Total Keseluruhan** - Tampilan total pemasukan dan pengeluaran
- **Edit & Hapus** - Kelola transaksi dengan mudah

### 🔐 Halaman Masuk/Keluar (Authentication)
- **Login dengan Google** - Integrasi OAuth Google (akan diaktifkan dengan API key)
- **Login dengan Email** - Sistem autentikasi berbasis email dan password
- **Registrasi Otomatis** - Pendaftaran pengguna baru yang mudah
- **Template Modern** - Desain UI/UX yang menarik dan responsif
- **Keamanan Tinggi** - Enkripsi data dan proteksi XSS/CSRF

## 🛡️ Keamanan

- ✅ Enkripsi data lokal menggunakan Base64
- ✅ Sanitasi input untuk mencegah XSS attacks
- ✅ Content Security Policy (CSP) headers
- ✅ Session management yang aman
- ✅ Auto-update setiap 3 hari untuk patch keamanan
- ✅ Validasi input pada semua form

## 🚀 Cara Menggunakan

### Instalasi
1. Clone repository:
```bash
git clone https://github.com/Hendra829/Arbon-Kas-44-Baru.git
cd Arbon-Kas-44-Baru
```

2. Buka `index.html` di browser:
```bash
# Atau gunakan live server
python -m http.server 8000
# Lalu buka http://localhost:8000
```

### Penggunaan
1. **Registrasi/Login** - Buat akun baru atau login dengan akun yang sudah ada
2. **Dashboard** - Lihat ringkasan dan analisis keuangan
3. **Tambah Transaksi** - Klik "Tambah Transaksi" di halaman Laporan
4. **Import Data** - Upload file CSV untuk import data massal
5. **Export Laporan** - Download laporan dalam format CSV, PDF, atau PPTX
6. **Analisis** - Lihat grafik dan statistik di Dashboard

## 📱 Responsive Design

Aplikasi ini fully responsive dan dapat digunakan di:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## 🔧 Teknologi

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Framework CSS**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Charts**: Chart.js
- **CSV Processing**: PapaParse
- **PDF Generation**: jsPDF
- **PowerPoint Generation**: PptxGenJS
- **Storage**: LocalStorage dengan enkripsi

## 📈 Optimisasi Kinerja

- Lazy loading untuk gambar dan konten
- Caching data di browser
- Debouncing pada pencarian
- Batch updates untuk performa maksimal
- Auto-cleanup data lama (maks 1000 transaksi)
- Minimal re-renders

## 🔄 Auto-Update

Aplikasi secara otomatis memeriksa dan melakukan optimisasi setiap 3 hari untuk:
- Membersihkan cache
- Optimisasi storage
- Update keamanan
- Perbaikan bug

## 👨‍💼 Hak Cipta

**Copyright © 2024 AR'BON. All Rights Reserved.**

Aplikasi ini adalah hak milik AR'BON dan dilindungi oleh undang-undang hak cipta.

## 📝 Lisensi

Lihat file [LICENSE](LICENSE) untuk detail lisensi.

## 🤝 Kontribusi

Untuk kontribusi atau pertanyaan, silakan hubungi tim AR'BON.

## 📞 Support

Untuk bantuan teknis atau pertanyaan, silakan buka issue di repository ini.

---

**Dibuat dengan ❤️ untuk AR'BON**
