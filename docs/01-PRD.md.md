# Product Requirement Document (PRD)
## Security Training Management System (STMS)

### 1. Pendahuluan
STMS adalah platform manajemen pelatihan satpam terintegrasi yang menjembatani Badan Usaha Jasa Pengamanan (BUJP) dengan Ditbinmas Kepolisian Daerah (Polda) untuk standardisasi kedinasan, transparansi nilai, dan penerbitan Ijazah/KTA digital yang sah secara hukum (UU ITE).

### 2. Sasaran Pengguna (Persona)
* **Calon/Anggota Satpam (Peserta):** Pendaftar diklat yang melek teknologi seluler (akses via smartphone).
* **Admin Pusdiklat (BUJP):** Staf operasional pengelola keuangan, absensi, dan data instruktur.
* **Verifikator/Pimpinan Polri (Polda):** Personel Ditbinmas Polda (Kasi Binlat / Dirbinmas) pengesah ijazah.
* **Perusahaan Pengguna Satpam (User/Klien):** Pihak ketiga yang ingin melakukan verifikasi keaslian ijazah pelamar kerja.

### 3. Cakupan Fitur MVP (Minimum Viable Product)
* **Portal Peserta:** Mandiri pendaftaran, cek kuota angkatan, upload berkas persyaratan, e-Rapor, dan download ijazah.
* **Verifikasi Berkas & Kelulusan:** Dashboard verifikasi dokumen pendaftaran dan input komponen nilai (Teori, Fisik, Menembak, Damkar).
* **Approval Polda:** Modul otorisasi penomoran ijazah kedinasan langsung dari akun Kepolisian.
* **Ijazah Engine:** Generator PDF berbasis HTML-to-PDF (Puppeteer Headless) dengan tanda tangan elektronik terenkripsi dan QR Code.
* **Integrasi WA Gateway:** Notifikasi otomatis *push-notification* tanpa bergantung pada email.
* **Audit Trail:** Logging ketat untuk setiap modifikasi data sensitif (Nilai, Status Lulus, Cetak Ulang).

### 4. Kriteria Keberhasilan (Success Metrics)
* Kecepatan generate dokumen ijazah PDF < 3 detik per dokumen.
* Keberhasilan pengiriman notifikasi WhatsApp mencapai > 98%.
* Skor keamanan enkripsi PDF tidak dapat dimanipulasi secara ilegal tanpa mematahkan tanda tangan digital.