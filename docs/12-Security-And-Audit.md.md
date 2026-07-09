# Protokol Keamanan dan Audit Trail

### 1. Mekanisme Proteksi Data
* **File Isolation:** File ijazah disimpan di direktori server lokal di luar folder root web publik (`public/`). File tidak bisa diakses langsung via URL statis browser.
* **Authorized Streaming:** Unduhan file harus melewati middleware Elysia.js. Jika token user tidak valid atau user mencoba mengunduh milik orang lain, sistem otomatis melempar error `403 Forbidden`.

### 2. Implementasi Sistem Log Audit (Audit Trail)
Setiap kali ada aktivitas perubahan nilai atau otorisasi ijazah oleh Polda, sistem mengeksekusi fungsi pencatatan log asinkron:

```typescript
async function logAudit(userId, action, tableName, beforeData, afterData, ipAddress) {
  await db.audit_trails.create({
    data: {
      user_id: userId,
      action: action,
      table_name: tableName,
      before_data: JSON.stringify(beforeData),
      after_data: JSON.stringify(afterData),
      ip_address: ipAddress
    }
  });
}