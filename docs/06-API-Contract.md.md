# Kontrak API (Elysia.js)

Semua endpoint dilindungi JWT kecuali Autentikasi dan Verifikasi QR Publik.

### 1. Autentikasi
* `POST /api/v1/auth/login`
    * Body: `{ email, password }`
    * Response 200: `{ token, user: { name, role } }`

### 2. Pendaftaran (Portal Peserta)
* `POST /api/v1/registration/apply`
    * Headers: `Authorization: Bearer <token>`
    * Body: Form-Data (Berkas gambar/PDF & MetaData)
    * Response 201: `{ message: "Pendaftaran berhasil diajukan" }`

### 3. Manajemen Nilai (Admin Pusdiklat)
* `PUT /api/v1/grades/:registrant_id`
    * Body: `{ theory_score, physical_score, special_skills_score, final_status }`
    * Response 200: `{ message: "Nilai berhasil diperbarui" }`

### 4. Kelulusan & Integrasi Ijazah (Polda Approver)
* `POST /api/v1/certificates/issue`
    * Body: `{ registrant_id, certificate_number }`
    * Response 201: `{ message: "Ijazah digital berhasil diterbitkan", download_url: "/api/v1/certificates/download/:id" }`

### 5. Verifikasi QR Publik (Tanpa Auth)
* `GET /api/v1/verify/:verification_token`
    * Response 200: `{ valid: true, data: { candidate_name, batch_name, certificate_number, status: "TERVERIFIKASI DI DITBINMAS POLDA" } }`