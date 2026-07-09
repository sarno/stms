-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "role" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_batches" (
    "id" UUID NOT NULL,
    "batch_name" VARCHAR(100) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "quota" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "training_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrants" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "ktp_number" VARCHAR(16) NOT NULL,
    "education_level" VARCHAR(30) NOT NULL,
    "document_urls" JSONB NOT NULL,
    "status_registration" VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "payment_status" VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registrants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" UUID NOT NULL,
    "registrant_id" UUID NOT NULL,
    "theory_score" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "physical_score" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "special_skills_score" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "final_status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "updated_by" UUID NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL,
    "registrant_id" UUID NOT NULL,
    "certificate_number" VARCHAR(100) NOT NULL,
    "verification_token" VARCHAR(64) NOT NULL,
    "file_path" TEXT NOT NULL,
    "issued_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "polda_approver_id" UUID NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_trails" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "table_name" VARCHAR(50) NOT NULL,
    "before_data" JSONB,
    "after_data" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_trails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "grades_registrant_id_key" ON "grades"("registrant_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_registrant_id_key" ON "certificates"("registrant_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_number_key" ON "certificates"("certificate_number");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_verification_token_key" ON "certificates"("verification_token");

-- AddForeignKey
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "training_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "registrants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "registrants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_polda_approver_id_fkey" FOREIGN KEY ("polda_approver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_trails" ADD CONSTRAINT "audit_trails_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
