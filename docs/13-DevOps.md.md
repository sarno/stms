# Konfigurasi Infrastruktur dan DevOps

### 1. Kebutuhan Server Manajemen (VPS)
* **Sistem Operasi:** Ubuntu Server 24.04 LTS LTS.
* **Spesifikasi Minimum:** 2 vCPU, 4 GB RAM (Dibutuhkan RAM minimal 4GB agar proses Chromium Headless Puppeteer berjalan lancar saat render PDF berbarengan).
* **Database:** PostgreSQL 16+.

### 2. Konfigurasi Nginx Reverse Proxy
Nginx mengelola enkripsi SSL (Let's Encrypt) dan meneruskan trafik ke backend runtime Bun port 3000 dan folder dist statis milik Vue.js.

```nginx
server {
    listen 80;
    server_name stms.namadomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name stms.namadomain.com;

    ssl_certificate /etc/letsencrypt/live/stms.namadomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stms.namadomain.com/privkey.pem;

    # Frontend Static SPA Vuejs
    location / {
        root /var/web/stms-frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Bun Elysia
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
