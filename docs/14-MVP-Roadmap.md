# Peta Jalan Pengembangan MVP (MVP Roadmap)

### **Minggu 1: Fondasi & Basis Data**
* Inisialisasi database PostgreSQL sesuai skema tabel core.
* Setup project backend Bun + Elysia.js dengan konfigurasi modul Auth JWT.
* Pembuatan struktur project frontend Vue 3, Vite, Pinia, dan Tailwind CSS.

### **Minggu 2: Fitur Inti Operasional & Registrasi**
* Fitur registrasi peserta, form upload berkas prasyarat dari portal Vue.js.
* Dashboard verifikasi data pendaftar untuk pihak internal Admin Pusdiklat.
* Integrasi asinkron pemanggilan kirim teks otomatis via API WhatsApp Gateway.

### **Minggu 3: Modul Penilaian & Ijazah Engine**
* Pembuatan form penginputan komponen nilai siswa oleh admin.
* Pengembangan *Ijazah Engine* menggunakan Puppeteer di backend Bun untuk membuat PDF lanskap dari draf HTML.
* Implementasi logika QR Code generator unik dan halaman publik verifikasi keaslian ijazah.

### **Minggu 4: Approval Polda, Audit & Deployment**
* Pembuatan modul otorisasi persetujuan nomor ijazah khusus akun Verifikator Polda.
* Pemasangan middleware Audit Trail untuk melacak aktivitas modifikasi data.
* Proses deployment aplikasi ke server VPS Ubuntu menggunakan Nginx, SSL, dan manajemen proses Bun di latar belakang.
