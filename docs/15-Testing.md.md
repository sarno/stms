# Strategi Pengujian Sistem (Testing)

Menggunakan modul bawaan Bun Test yang sangat cepat untuk melakukan verifikasi kode program backend.

### 1. Skenario Unit Testing (Uji Fungsi)
* **Fungsi Registrasi:** Memastikan pendaftar tidak bisa memilih angkatan diklat yang kuotanya sudah habis (`quota <= 0`).
* **Fungsi Autentikasi:** Memastikan endpoint terproteksi mengembalikan status `401 Unauthorized` jika token JWT absen/kadaluwarsa.

### 2. Skenario Integration Testing (Uji Integrasi)
* **Uji Alur Ijazah Engine:** Meniru proses input kelulusan -> memicu Puppeteer render PDF -> Memeriksa apakah file PDF fisik sukses terbentuk di local storage.
* Contoh implementasi pengujian sederhana menggunakan `bun test`:

```typescript
import { expect, test, describe } from "bun:test";

describe("Ijazah Engine Integration Test", () => {
  test("Harus sukses mengenerate file PDF di local folder", async () => {
    const fileExists = await checkGeneratedPdfFile("dummy-registrant-id");
    expect(fileExists).toBe(true);
  });
});