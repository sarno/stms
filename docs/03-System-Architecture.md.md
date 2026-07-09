# Arsitektur Sistem (System Architecture)

### 1. Gambaran Umum Komponen Teknologi
Sistem ini menggunakan arsitektur monolitik terpisah (*Decoupled Monolith*) yang memisahkan Frontend SPA dan Backend API berkinerja tinggi.


[ Client Browser (Vue 3 / Pinia) ]
                   │ (HTTP / JSON)
                   ▼
     [ Backend API (Bun + Elysia.js) ]
      ├── Auth & Core Logic (Domain)
      ├── Ijazah Engine (Puppeteer Headless)
      └── Logger (Audit Trail Async)
                   │
     ┌─────────────┴─────────────┐
     ▼                           ▼

[ Database PostgreSQL ]     [ WA Gateway API ] (External Agency)

### 2. Stack Komponen Internal
* **Runtime:** Bun v1.x (Sangat cepat untuk I/O, native TypeScript execution).
* **Framework API:** Elysia.js (Mendukung performa maksimal, tipe data aman end-to-end via Elysia TypeBox).
* **Database Client:** Prisma ORM atau Kysely (Query builder tipe aman untuk PostgreSQL).
* **PDF Worker:** Chromium Headless internal yang dikendalikan oleh Puppeteer melalui Bun API.
* **Local Storage:** File PDF ijazah disimpan dalam folder lokal direktori terenkripsi di server internal aplikasi, terlindung dari akses publik langsung (*Protected Route*).
