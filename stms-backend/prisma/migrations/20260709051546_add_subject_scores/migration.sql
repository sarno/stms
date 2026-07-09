-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "subject_scores" JSONB NOT NULL DEFAULT '{}';
