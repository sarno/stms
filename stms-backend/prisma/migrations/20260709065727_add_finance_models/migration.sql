-- AlterTable
ALTER TABLE "registrants" ADD COLUMN     "payment_amount" DECIMAL(12,2),
ADD COLUMN     "payment_date" TIMESTAMP,
ADD COLUMN     "payment_note" VARCHAR(255),
ADD COLUMN     "verified_by" UUID;

-- CreateTable
CREATE TABLE "service_rates" (
    "id" UUID NOT NULL,
    "training_type" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "service_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_rates_training_type_key" ON "service_rates"("training_type");
