# Struktur Domain-Driven Design (DDD)

Aplikasi distrukturkan berdasarkan batasan konteks (*Bounded Context*) di dalam direktori backend:

src/
├── domains/
│   ├── Auth/              # Manajemen User, Login, JWT Session
│   ├── Registration/      # Pengelolaan pendaftaran, upload berkas persyaratan
│   ├── Training/          # Kelas Angkatan, Jadwal, Kurikulum, Absensi
│   ├── Grading/           # Komponen Nilai (Teori, Fisik, Menembak, Damkar)
│   ├── Cert_Engine/       # Pembuatan Ijazah, QR Code Generator, Signer Module
│   └── Verification/      # Publik verifikasi ijazah via QR Code scan
├── shared/                # Middleware, Infrastruktur Database, WA Client Helper
└── index.ts               # Entry point Elysia.js


### Kebijakan Aturan Domain (Domain Rules)
* **Cert_Engine** tidak boleh mengubah status kelulusan peserta. Ia hanya bersifat *Read data* dari domain `Grading` dan `Registration` untuk mencetak ijazah apabila status kelulusan sudah valid (`LULUS`).
* Setiap kali domain `Cert_Engine` berhasil menerbitkan dokumen, ia wajib memicu *Domain Event* untuk mencatat riwayat di sistem Audit Trail.
