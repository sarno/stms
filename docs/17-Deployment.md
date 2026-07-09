# Panduan Deployment VPS — STMS

> Panduan lengkap instalasi STMS di VPS menggunakan Docker + Nginx reverse proxy.

---

## Daftar Isi

1. [Prasyarat](#1-prasyarat)
2. [Clone Project](#2-clone-project)
3. [Konfigurasi Environment](#3-konfigurasi-environment)
4. [Build & Jalankan dengan Docker](#4-build--jalankan-dengan-docker)
5. [Nginx Reverse Proxy + SSL](#5-nginx-reverse-proxy--ssl)
6. [Migrasi Database](#6-migrasi-database)
7. [Monitoring & Logs](#7-monitoring--logs)
8. [Backup & Restore](#8-backup--restore)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prasyarat

| Komponen | Spesifikasi |
|----------|-------------|
| **OS** | Ubuntu 22.04 / 24.04 LTS |
| **CPU** | Minimal 2 core (4 core recommended) |
| **RAM** | Minimal 4 GB (8 GB recommended) |
| **Disk** | Minimal 20 GB |
| **Domain** | Sudah pointing ke IP VPS |
| **Port** | 22 (SSH), 80 (HTTP), 443 (HTTPS) |

**Software yang akan diinstal:**
- Docker & Docker Compose
- Nginx
- Certbot (Let's Encrypt)
- Git

---

## 2. Clone Project

```bash
# Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Logout & login kembali agar group docker aktif

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone project
cd /opt
git clone https://github.com/your-org/stms.git
cd stms
```

---

## 3. Konfigurasi Environment

Buat file `.env` di root project:

```bash
nano /opt/stms/.env
```

Isi dengan:

```env
# Database
DB_USER=stms
DB_PASSWORD=ubah_ini_password_kuat
DB_NAME=stms

# JWT Secret — generate dengan: openssl rand -hex 64
JWT_SECRET=generate_dengan_openssl_rand_hex_64

# Base URL — domain yang digunakan
BASE_URL=https://stms.example.com
```

---

## 4. Build & Jalankan dengan Docker

```bash
cd /opt/stms

# Build image
docker-compose build

# Jalankan semua service
docker-compose up -d

# Cek status
docker-compose ps
docker-compose logs -f app
```

**Struktur container:**

| Container | Port | Fungsi |
|-----------|------|--------|
| `stms-app` | 3000 | Backend (Bun) + Frontend (Vue SPA) |
| `stms-db` | 5432 | PostgreSQL |

**Volume persisten:**

| Volume | Mount | Fungsi |
|--------|-------|--------|
| `stms-pgdata` | `/var/lib/postgresql/data` | Data database |
| `stms-uploads` | `/app/storage/uploads` | File upload peserta |
| `stms-certs` | `/app/storage/secure_certs` | File PDF ijazah |

---

## 5. Nginx Reverse Proxy + SSL

### 5.1 Konfigurasi Nginx

```bash
# Copy config Nginx
sudo cp /opt/stms/nginx.conf /etc/nginx/sites-available/stms

# Edit domain
sudo nano /etc/nginx/sites-available/stms
# → Ganti semua stms.example.com dengan domain asli

# Aktifkan site
sudo ln -s /etc/nginx/sites-available/stms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5.2 SSL dengan Let's Encrypt

Setelah Nginx berjalan dan domain sudah pointing, jalankan Certbot:

```bash
sudo certbot --nginx -d stms.example.com
```

Pilih opsi **2: redirect HTTP ke HTTPS**.

### 5.3 Auto-renewal SSL

Certbot otomatis menambahkan systemd timer. Verifikasi:

```bash
sudo systemctl status certbot.timer
# Test renewal
sudo certbot renew --dry-run
```

---

## 6. Migrasi Database

Setelah container berjalan, jalankan migrasi:

```bash
# Masuk ke container app
docker-compose exec app sh

# Di dalam container, jalankan migrasi
bun prisma migrate deploy

# (Opsional) Seed data awal
bun prisma/seed.ts

exit
```

Atau dari luar container:

```bash
docker-compose exec app bun prisma migrate deploy
```

---

## 7. Monitoring & Logs

### 7.1 Logs Container

```bash
# Semua service
docker-compose logs -f

# Service tertentu
docker-compose logs -f app
docker-compose logs -f db

# 100 baris terakhir
docker-compose logs --tail=100 app
```

### 7.2 Logs Nginx

```bash
# Access log
tail -f /var/log/nginx/stms-access.log

# Error log
tail -f /var/log/nginx/stms-error.log
```

### 7.3 Resource Monitoring

```bash
# Semua container
docker stats

# Disk usage
docker system df
```

---

## 8. Backup & Restore

### 8.1 Backup Database

```bash
#!/bin/bash
# backup-stms.sh — jalankan via cron

BACKUP_DIR="/opt/backups/stms"
DATE=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T db pg_dump -U stms stms | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup storage
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz \
  -C /opt/stms/stms-backend/storage .

# Hapus backup lebih dari 30 hari
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

Crontab (backup setiap jam 2 pagi):

```bash
0 2 * * * /opt/stms/backup-stms.sh
```

### 8.2 Restore

```bash
# Restore database
gunzip -c backup_db.sql.gz | docker-compose exec -T db psql -U stms stms

# Restore storage
tar -xzf backup_storage.tar.gz -C /opt/stms/stms-backend/storage
```

---

## 9. Troubleshooting

### 9.1 WhatsApp QR Code

WhatsApp membutuhkan scan QR code setiap restart. QR code muncul di log container:

```bash
docker-compose logs -f app
# Cari QR code, scan dengan WhatsApp
```

Untuk persistensi session, volume `stms-uploads` juga menyimpan auth file WhatsApp
di `storage/wa_auth/`.

### 9.2 Puppeteer / PDF tidak berfungsi

Pastikan Chromium terinstall di container:

```bash
docker-compose exec app which chromium-browser
```

Jika error "No usable sandbox", pastikan argumen `--no-sandbox` digunakan
(sudah diatur di `Cert_Engine/index.ts`).

### 9.3 Database connection refused

```bash
# Cek apakah database berjalan
docker-compose ps db

# Cek log database
docker-compose logs db

# Pastikan environment variable DATABASE_URL benar
# format: postgresql://user:password@db:5432/stms
```

### 9.4 Permission denied storage

```bash
# Perbaiki permission di host
sudo chown -R 1000:1000 /opt/stms/stms-backend/storage
```

### 9.5 Rebuild & Restart

```bash
# Rebuild ulang image
docker-compose build --no-cache app

# Restart semua
docker-compose down
docker-compose up -d
```

---

## Lampiran

### Struktur File Deployment

```
/opt/stms/
├── .env                    # Environment variables
├── docker-compose.yml      # Docker Compose config
├── Dockerfile              # Docker build
├── nginx.conf              # Nginx reverse proxy config
├── start.sh                # Production start script
├── backup-stms.sh          # Backup script
├── stms-backend/
│   ├── src/                # Backend source
│   ├── prisma/             # Prisma schema & migrations
│   ├── storage/            # Uploads & certificates
│   │   ├── uploads/
│   │   ├── secure_certs/
│   │   └── wa_auth/
│   └── package.json
├── stms-frontend/
│   ├── src/                # Frontend source
│   ├── dist/               # Built files (docker build)
│   └── package.json
└── docs/
    └── 17-Deployment.md    # Panduan ini
```

### Docker Images

| Image | Source | Base |
|-------|--------|------|
| `stms-app` | Local build | `oven/bun:1.2` + Chromium |
| `postgres:16-alpine` | Docker Hub | Alpine Linux |

### Port Mapping

| Layanan | Container | Host | Protocol |
|---------|-----------|------|----------|
| App | 3000 | 127.0.0.1:3000 | HTTP (internal) |
| DB | 5432 | — | TCP (internal) |
| Nginx | 80 / 443 | 0.0.0.0:80/443 | HTTP/HTTPS |
