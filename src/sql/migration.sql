-- CreateTable: report_history
CREATE TABLE IF NOT EXISTS "report_history" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "student_email" TEXT NOT NULL,
    "report_type" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "custom_template" JSONB,
    "stats" JSONB NOT NULL,
    "total_attendances" INTEGER NOT NULL DEFAULT 0,
    "completed_attendances" INTEGER NOT NULL DEFAULT 0,
    "total_trainings" INTEGER NOT NULL DEFAULT 0,
    "completed_trainings" INTEGER NOT NULL DEFAULT 0,
    "success_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_size" INTEGER,

    CONSTRAINT "report_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_history_student_id_idx" ON "report_history"("student_id");
CREATE INDEX "report_history_generated_at_idx" ON "report_history"("generated_at");
