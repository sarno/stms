# Analisis Alur Bisnis (Business Flow)

### 1. Alur Pendaftaran & Validasi Dokumen
1. User masuk ke Portal Vue.js -> Memilih Angkatan Diklat yang tersedia (misal: Gada Pratama Angkatan 80).
2. User melengkapi profil dan mengunggah dokumen (KTP, Ijazah Terakhir, SKCK, Surat Sehat, Pas Foto Background Biru).
3. Status berubah menjadi `PENDING_VERIFICATION`.
4. Admin Pusdiklat mengecek berkas via Dashboard:
   * Jika tidak valid -> Status `REJECTED`, otomatis kirim WA notifikasi bagian yang salah untuk diperbaiki.
   * Jika valid -> Status `APPROVED`, otomatis kirim WA berisi tagihan pembayaran (Invoice).

### 2. Alur Pelatihan & Kelulusan
1. Peserta mengikuti pelatihan selama 14 hari (Gada Pratama).
2. Instruktur menginput nilai harian dan ujian akhir ke sistem.
3. Di akhir diklat, diadakan sidang pleno kelulusan antara BUJP dan Polda.
4. Admin mengubah status peserta di sistem menjadi `LULUS` atau `TIDAK_LULUS`.

### 3. Alur Penerbitan Ijazah Kedinasan (Polri Sign-off)
1. Sistem mengelompokkan data peserta yang `LULUS` dalam satu angkatan.
2. Akun Polda (Verifikator) masuk ke sistem -> Memeriksa kesesuaian nilai -> Klik `Approve`.
3. Sistem secara otomatis memberikan **Nomor Ijazah Kedinasan** sesuai urutan dari Polda.
4. Sistem memicu *Ijazah Engine* untuk membuat PDF, menyematkan TTD Digital Kriptografi, menempelkan QR Code Verifikasi, dan menyimpannya di local storage aplikasi.
5. WA Gateway mengirim pesan otomatis ke peserta dengan link unduhan ijazah.