# Manajemen Hak Akses (Role and Permission)

Sistem menerapkan model **RBAC (Role-Based Access Control)** ketat untuk tiga aktor utama:

| Hak Akses / Kemampuan | Admin Pusdiklat | Verifikator Polda | Peserta (Satpam) |
| :--- | :---: | :---: | :---: |
| Mengajukan Registrasi & Upload Berkas | ❌ | ❌ |  |
| Verifikasi Kelayakan Berkas Awal |  | ❌ | ❌ |
| Input & Edit Nilai Komponen Diklat |  | ❌ | ❌ |
| Memasukkan Nomor Ijazah & Klik Approve | ❌ |  | ❌ |
| Melakukan Tanda Tangan Digital Ijazah |  |  | ❌ |
| Mengunduh File Ijazah Digital Sendiri | ❌ | ❌ |  |
| Mengunduh File Ijazah Semua Peserta |  |  | ❌ |
| Membaca Log Sistem (Audit Trail) |  |  | ❌ |

*Keterangan:* = Memiliki Akses Penuh, ❌ = Akses Ditolak Sistem.