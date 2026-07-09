# Spesifikasi Frontend (Vue 3 + Pinia)

### 1. Setup & Desain Sistem
* **Teknologi:** Vue 3 (Composition API), Vite, Pinia (State Management), Tailwind CSS.
* **Komponen UI:** Menggunakan komponen kustom Tailwind CSS yang bersih, responsif, berfokus pada navigasi mobile yang ramah bagi peserta satpam di lapangan.

### 2. Pembagian Manajemen State (Pinia Stores)
* `auth.js`: Menyimpan data JWT token, informasi profile user, dan hak akses *role*.
* `registration.js`: Mengatur tahapan wizard pendaftaran peserta beserta berkas dokumen.
* `grade.js`: Membantu admin mengelola form nilai siswa secara massal tanpa harus memuat ulang (*reload*) halaman.

### 3. Keamanan Client-Side
* **Route Guards:** Membatasi akses menu menggunakan meta data Vue Router (misal: Halaman Polda hanya bisa dibuka jika `store.auth.user.role === 'POLDA_VERIFICATOR'`).
* **Token Interceptor:** Axios / Fetch interceptor untuk menyematkan token JWT secara otomatis di setiap *request* backend.