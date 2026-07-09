import Elysia from "elysia";
import prisma from "../../shared/db";

export const publicRoutes = new Elysia({ prefix: "/api/v1/public" })
  .get("/stats", async () => {
    const [batches, certificates] = await Promise.all([
      prisma.trainingBatch.count(),
      prisma.certificate.count(),
    ]);

    return {
      batches,
      graduates: certificates,
      instructors: 6,
      trainingCenters: 3,
    };
  });
