# Sistem Verifikasi QR Code

Fitur untuk memvalidasi keaslian dokumen ijazah di lapangan oleh perusahaan pengguna jasa pengamanan.

### 1. Struktur Pembuatan Data QR Code
* Setiap sertifikat memiliki properti kolumnar unik bernama `verification_token` yang merupakan string acak panjang aman (SHA-256 hash).
* Teks terenkripsi di dalam gambar QR Code berupa link absolut:
    `https://stms.namadomain.com/verify/a1b2c3d4e5f6g7h8...`

### 2. Alur Pemeriksaan Pengguna (HRD Perusahaan)
1. Perusahaan melakukan scan QR Code pada lembaran ijazah fisik atau digital satpam menggunakan kamera handphone.
2. Browser handphone membuka link verifikasi di atas.
3. Frontend Vue.js menangkap token dari URL parameter dan mengirimkannya ke API Backend `/api/v1/verify/:token`.
4. Backend mencari token di tabel `certificates`.
    * **Jika data ditemukan:** Menampilkan nama satpam, kualifikasi diklat, foto resmi, instansi pelatih, dan tanggal terbit dengan tanda centang hijau **"IJAZAH ASLI - TERVERIFIKASI"**.
    * **Jika data tidak ditemukan:** Menampilkan tanda silang merah **"PERINGATAN: DATA IJAZAH TIDAK DIKENALI / PALSU"**.