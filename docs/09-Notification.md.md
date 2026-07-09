# Arsitektur Notifikasi WhatsApp

Sistem berinteraksi dengan API WhatsApp Gateway eksternal secara asinkron (*non-blocking*) agar tidak memperlambat respon request user di Elysia.js.

### Implementasi Alur Kerja Notifikasi:
1. Perubahan data terjadi di Database (misal: Nilai lulus dimasukkan).
2. Domain memanggil `WAService.sendText(phoneNumber, message)`.
3. Bun menggunakan fungsi bawaan `fetch()` untuk menembak API Endpoint Gateway WA secara asinkron.

### Format Template Template Pesan WhatsApp:
* **Template Invoice Pendaftaran:**
    > "Halo *{{name}}*, Berkas pendaftaran Anda untuk *{{batch_name}}* dinyatakan **LENGKAP**. Silakan lakukan pembayaran investasi diklat sebesar RpX.XXX.XXX ke rekening BUJP resmi. Hubungi admin via sistem untuk unggah bukti bayar."
* **Template Penerbitan Ijazah (Polda Approved):**
    > "Selamat *{{name}}*! Ijazah Gada Pratama Anda telah resmi diterbitkan oleh Ditbinmas Polda dengan nomor *{{cert_number}}*. Anda dapat mengunduh berkas ijazah digital legalitas Anda di link berikut: {{download_url}}"