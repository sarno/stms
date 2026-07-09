-- Add columns as nullable first
ALTER TABLE "certificates" ADD COLUMN "issued_by_id" UUID;
ALTER TABLE "certificates" ADD COLUMN "signed_at" TIMESTAMP;
ALTER TABLE "certificates" ALTER COLUMN "polda_approver_id" DROP NOT NULL;
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_polda_approver_id_fkey";

-- Backfill issued_by_id for existing rows with the admin user
UPDATE "certificates" SET "issued_by_id" = '12784eec-93a8-44a5-8944-a2820a02b193' WHERE "issued_by_id" IS NULL;

-- Backfill signed_at for existing rows that already have polda_approver_id
UPDATE "certificates" SET "signed_at" = "issued_at" WHERE "polda_approver_id" IS NOT NULL AND "signed_at" IS NULL;

-- Now make issued_by_id NOT NULL
ALTER TABLE "certificates" ALTER COLUMN "issued_by_id" SET NOT NULL;

-- Add foreign keys
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_issued_by_id_fkey" FOREIGN KEY ("issued_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_polda_approver_id_fkey" FOREIGN KEY ("polda_approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
