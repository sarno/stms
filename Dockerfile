# ============================================================
# STMS — Docker Production Build
# ============================================================

# ---- Stage 1: Build Frontend ----
FROM oven/bun:1.2 AS frontend-builder
WORKDIR /build
COPY stms-frontend/package.json stms-frontend/bun.lock ./
RUN bun install --frozen-lockfile
COPY stms-frontend/ .
RUN bun run build

# ---- Stage 2: Backend Runtime ----
FROM oven/bun:1.2

# Install Chromium for Puppeteer PDF generation
RUN apt-get update && apt-get install -y \
    chromium-browser \
    libgbm-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copy backend deps & install
COPY stms-backend/package.json stms-backend/bun.lock ./
RUN bun install --frozen-lockfile

# Copy Prisma schema & generate client
COPY stms-backend/prisma ./prisma
RUN bun prisma generate

# Copy backend source
COPY stms-backend/src ./src
COPY stms-backend/tsconfig.json ./

# Copy built frontend from stage 1
COPY --from=frontend-builder /build/dist ./stms-frontend/dist

# Create storage directories
RUN mkdir -p storage/uploads storage/secure_certs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["bun", "src/index.ts"]
