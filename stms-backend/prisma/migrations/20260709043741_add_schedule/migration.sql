-- CreateTable
CREATE TABLE "schedules" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "day" VARCHAR(10) NOT NULL,
    "subject" VARCHAR(150) NOT NULL,
    "instructor" VARCHAR(150) NOT NULL,
    "room" VARCHAR(50) NOT NULL,
    "start" VARCHAR(5) NOT NULL,
    "end" VARCHAR(5) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "week" INTEGER,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "training_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
