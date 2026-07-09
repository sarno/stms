# Panduan Penerapan Sistem (Deployment Guide)

Langkah demi langkah meluncurkan sistem STMS secara langsung di lingkungan server VPS Ubuntu.

### Langkah 1: Install Runtime Bun & Library Di Server
```bash
# Install Bun Runtime
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Pasang dependency browser headless untuk kebutuhan Puppeteer di OS Ubuntu
sudo apt-get update
sudo apt-get install -y libgbm-dev gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget