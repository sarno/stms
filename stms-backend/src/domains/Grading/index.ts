import Elysia from "elysia";
import prisma from "../../shared/db";

export const gradingRoutes = new Elysia({ prefix: "/api/v1/grades" })
  .get(
    "/batch/:batch_id",
    async ({ params, jwt, set, headers }) => {
      const authHeader = headers["authorization"];
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token tidak ditemukan" };
      }
      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload || !["ADMIN_PUSDIKLAT", "POLDA_VERIFICATOR"].includes(payload.role as string)) {
        set.status = 403;
        return { error: "Akses ditolak" };
      }

      const registrants = await prisma.registrant.findMany({
        where: {
          batchId: params.batch_id,
          statusRegistration: "APPROVED",
        },
        include: {
          user: { select: { name: true } },
          grade: true,
        },
        orderBy: { createdAt: "asc" },
      });

      return registrants;
    }
  )
  .put(
    "/:registrant_id",
    async ({ params, body, jwt, set, headers }) => {
      const authHeader = headers["authorization"];
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token tidak ditemukan" };
      }
      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload || payload.role !== "ADMIN_PUSDIKLAT") {
        set.status = 403;
        return { error: "Akses ditolak" };
      }

      const { theory_score, physical_score, special_skills_score, subject_scores } = body as {
        theory_score: number;
        physical_score: number;
        special_skills_score: number;
        subject_scores?: Record<string, number>;
      };

      const subjScores = subject_scores || {};
      const vals = Object.values(subjScores).filter(v => v > 0);
      const avg = vals.length > 0
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : (theory_score + physical_score + special_skills_score) / 3;
      const final_status = avg >= 70 ? "LULUS" : "TIDAK_LULUS";

      const grade = await prisma.grade.upsert({
        where: { registrantId: params.registrant_id },
        update: {
          theoryScore: theory_score,
          physicalScore: physical_score,
          specialSkillsScore: special_skills_score,
          subjectScores: subjScores,
          finalStatus: final_status,
          updatedBy: payload.sub as string,
        },
        create: {
          registrantId: params.registrant_id,
          theoryScore: theory_score,
          physicalScore: physical_score,
          specialSkillsScore: special_skills_score,
          subjectScores: subjScores,
          finalStatus: final_status,
          updatedBy: payload.sub as string,
        },
      });

      await prisma.auditTrail.create({
        data: {
          userId: payload.sub as string,
          action: "UPDATE_GRADE",
          tableName: "grades",
          afterData: {
            registrantId: params.registrant_id,
            subject_scores: subjScores,
            final_status,
          },
          ipAddress: headers["x-forwarded-for"] as string || "unknown",
        },
      });

      return { message: "Nilai berhasil diperbarui", data: grade };
    }
  );
