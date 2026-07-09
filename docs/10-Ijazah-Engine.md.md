# Dokumentasi Ijazah Engine (PDF Generator)

Mesin pembuat ijazah dikembangkan menggunakan **Puppeteer (Chromium Headless)** berjalan di dalam runtime Bun.

### 1. Komponen Desain Dokumen
* **Layout:** Ukuran A4 Lanskap (*Landscape*).
* **Aset Visual:** Background ijazah bingkai resmi kedinasan bermutu tinggi disimpan di direktori lokal terlindung.
* **Tipografi:** Memanfaatkan font sistem standar atau Google Fonts bergaya formal (*Times New Roman / Serif*).

### 2. Mekanisme Enkripsi Dokumen & Tanda Tangan
* Sistem menyusun kode dokumen HTML lengkap yang berisi data nama, nomor ijazah, dan gambar QR code yang sudah diubah ke format *Base64 Data URI*.
* Puppeteer memuat kode HTML tersebut dan mengekspornya menjadi berkas buffer PDF instan (`page.pdf()`).
* Untuk kebutuhan integrasi regulasi tanda tangan digital instansi, buffer PDF diproses menggunakan modul internal kriptografi berbasis `node-signpdf` / `pdf-lib` untuk mengunci berkas dengan sertifikat digital otoritas pengesah, mencegah modifikasi pasca-terbit.
* File PDF biner akhir disimpan ke folder internal server: `storage/app/secure_certs/{{certificate_id}}.pdf`.