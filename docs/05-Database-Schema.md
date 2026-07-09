# Skema Database (PostgreSQL)

```sql
-- Aktivasi Ekstensi UUID jika diperlukan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role VARCHAR(30) NOT NULL, -- 'ADMIN_PUDIKLAT', 'POLDA_VERIFICATOR', 'PESERTA'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Angkatan Pelatihan
CREATE TABLE training_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_name VARCHAR(100) NOT NULL, -- e.g., 'Gada Pratama Angkatan 80'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    quota INT NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' -- 'OPEN', 'ONGOING', 'COMPLETED'
);

-- Table Pendaftaran Peserta
CREATE TABLE registrants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    batch_id UUID REFERENCES training_batches(id),
    ktp_number VARCHAR(16) NOT NULL,
    education_level VARCHAR(30) NOT NULL,
    document_urls JSONB NOT NULL, -- Menyimpan path berkas lokal (ktp, skck, dll.)
    status_registration VARCHAR(30) DEFAULT 'PENDING_VERIFICATION', -- 'APPROVED', 'REJECTED'
    payment_status VARCHAR(30) DEFAULT 'UNPAID', -- 'PARTIAL', 'PAID'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Penilaian
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registrant_id UUID REFERENCES registrants(id) UNIQUE,
    theory_score NUMERIC(5,2) DEFAULT 0.0,
    physical_score NUMERIC(5,2) DEFAULT 0.0,
    special_skills_score NUMERIC(5,2) DEFAULT 0.0, -- Damkar, Menembak, dll.
    final_status VARCHAR(20) DEFAULT 'PENDING', -- 'LULUS', 'TIDAK_LULUS'
    updated_by UUID REFERENCES users(id)
);

-- Table Ijazah Digital
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registrant_id UUID REFERENCES registrants(id) UNIQUE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    verification_token VARCHAR(64) UNIQUE NOT NULL, -- Token untuk QR Code URL
    file_path TEXT NOT NULL, -- Disimpan lokal di server aplikasi
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    polda_approver_id UUID REFERENCES users(id)
);

-- Table Audit Trail
CREATE TABLE audit_trails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL, -- e.g., 'UPDATE_GRADE', 'RE-ISSUE_CERTIFICATE'
    table_name VARCHAR(50) NOT NULL,
    before_data JSONB,
    after_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);