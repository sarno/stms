-- CreateTable
CREATE TABLE "attendance" (
    "id" UUID NOT NULL,
    "registrant_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" VARCHAR(10) NOT NULL DEFAULT 'ABSENT',
    "check_in" VARCHAR(5),
    "check_out" VARCHAR(5),
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_registrant_id_batch_id_date_key" ON "attendance"("registrant_id", "batch_id", "date");

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_registrant_id_fkey" FOREIGN KEY ("registrant_id") REFERENCES "registrants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "training_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
