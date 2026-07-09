import Elysia from "elysia";
import prisma from "../../shared/db";

export const poldaRoutes = new Elysia({ prefix: "/api/v1/polda" })
  .get(
    "/batches",
    async ({ jwt, set, headers }) => {
      const authHeader = headers["authorization"];
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token tidak ditemukan" };
      }
      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload || payload.role !== "POLDA_VERIFICATOR") {
        set.status = 403;
        return { error: "Akses ditolak" };
      }

      const batches = await prisma.trainingBatch.findMany({
        where: { status: { in: ["ONGOING", "COMPLETED"] } },
        include: {
          _count: { select: { registrants: true } },
        },
        orderBy: { startDate: "desc" },
      });

      return batches;
    }
  )
  .get(
    "/batch/:batch_id/graduates",
    async ({ params, jwt, set, headers }) => {
      const authHeader = headers["authorization"];
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token tidak ditemukan" };
      }
      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload || payload.role !== "POLDA_VERIFICATOR") {
        set.status = 403;
        return { error: "Akses ditolak" };
      }

      const graduates = await prisma.registrant.findMany({
        where: {
          batchId: params.batch_id,
          statusRegistration: "APPROVED",
          grade: { finalStatus: "LULUS" },
        },
        include: {
          user: { select: { name: true, email: true } },
          grade: true,
          certificate: { select: { id: true, certificateNumber: true, issuedAt: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      return graduates;
    }
  )
  .post(
    "/issue-certificate",
    async ({ body, jwt, set, headers }) => {
      const authHeader = headers["authorization"];
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token tidak ditemukan" };
      }
      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload || payload.role !== "POLDA_VERIFICATOR") {
        set.status = 403;
        return { error: "Hanya Verifikator Polda yang dapat menerbitkan ijazah" };
      }

      const { registrant_id, certificate_number } = body as {
        registrant_id: string;
        certificate_number: string;
      };

      const res = await fetch("http://localhost:3000/api/v1/certificates/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ registrant_id, certificate_number }),
      });

      const data = await res.json();
      set.status = res.status as any;
      return data;
    }
  )
  .post(
    "/bulk-issue-certificates",
    async ({ body, jwt, set, headers }) => {
      const authHeader = headers["authorization"];
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token tidak ditemukan" };
      }
      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload || payload.role !== "POLDA_VERIFICATOR") {
        set.status = 403;
        return { error: "Hanya Verifikator Polda yang dapat menerbitkan ijazah" };
      }

      const { registrant_ids, cert_prefix } = body as {
        registrant_ids: string[];
        cert_prefix: string;
      };

      if (!registrant_ids?.length) {
        set.status = 400;
        return { error: "Tidak ada peserta dipilih" };
      }

      const results: { registrant_id: string; certificate_number: string; status: string }[] = [];

      for (let i = 0; i < registrant_ids.length; i++) {
        const certNumber = `${cert_prefix}-${String(i + 1).padStart(4, "0")}`;
        try {
          const res = await fetch("http://localhost:3000/api/v1/certificates/issue", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({ registrant_id: registrant_ids[i], certificate_number: certNumber }),
          });
          const data = await res.json();
          results.push({
            registrant_id: registrant_ids[i],
            certificate_number: certNumber,
            status: res.ok ? "success" : `error: ${data.error || "Unknown"}`,
          });
        } catch {
          results.push({ registrant_id: registrant_ids[i], certificate_number: certNumber, status: "error: network" });
        }
      }

      const succeeded = results.filter(r => r.status === "success").length;
      return {
        message: `${succeeded} dari ${registrant_ids.length} sertifikat berhasil diterbitkan`,
        results,
      };
    }
  )
  .patch(
    "/batch/:batch_id/status",
    async ({ params, body, jwt, set, headers }) => {
      const authHeader = headers["authorization"];
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token tidak ditemukan" };
      }
      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload || payload.role !== "POLDA_VERIFICATOR") {
        set.status = 403;
        return { error: "Akses ditolak" };
      }

      const { status } = body as { status: string };
      const valid = ["OPEN", "ONGOING", "COMPLETED"];
      if (!valid.includes(status)) {
        set.status = 400;
        return { error: "Status tidak valid" };
      }

      const batch = await prisma.trainingBatch.update({
        where: { id: params.batch_id },
        data: { status },
      });

      await prisma.auditTrail.create({
        data: {
          userId: payload.sub as string,
          action: "UPDATE_BATCH_STATUS",
          tableName: "training_batches",
          afterData: { batch_id: params.batch_id, status },
          ipAddress: headers["x-forwarded-for"] as string || "unknown",
        },
      });

      return { message: "Status angkatan diperbarui", data: batch };
    }
  );
