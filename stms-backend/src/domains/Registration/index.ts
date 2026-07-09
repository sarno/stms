import Elysia, { t } from "elysia";
import prisma from "../../shared/db";
import { waService } from "../../shared/whatsapp";
import { join } from "path";
import { mkdir } from "fs/promises";

const UPLOAD_DIR = join(process.cwd(), "storage", "uploads");

export const registrationRoutes = new Elysia({ prefix: "/api/v1/registration" })
  .post(
    "/apply",
    async ({ body, jwt, set, headers, request }) => {
      const authHeader = headers["authorization"];
      if (!authHeader?.startsWith("Bearer ")) {
        set.status = 401;
        return { error: "Token tidak ditemukan" };
      }
      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload) {
        set.status = 401;
        return { error: "Token tidak valid" };
      }

      const userId = payload.sub as string;
      const { batch_id, ktp_number, education_level, ktp_file, skck_file, foto_file } = body as any;

      await mkdir(UPLOAD_DIR, { recursive: true });

      const savedFiles: Record<string, string> = {};

      for (const [key, file] of Object.entries({ ktp: ktp_file, skck: skck_file, foto: foto_file })) {
        if (file && file instanceof File) {
          const ext = file.name.split(".").pop();
          const filename = `${userId}_${key}_${Date.now()}.${ext}`;
          const filepath = join(UPLOAD_DIR, filename);
          await Bun.write(filepath, await file.arrayBuffer());
          savedFiles[key] = `/storage/uploads/${filename}`;
        }
      }

      const existing = await prisma.registrant.findFirst({
        where: { userId, batchId: batch_id },
      });

      if (existing) {
        set.status = 409;
        return { error: "Anda sudah mendaftar pada angkatan ini" };
      }

      const registrant = await prisma.registrant.create({
        data: {
          userId,
          batchId: batch_id,
          ktpNumber: ktp_number,
          educationLevel: education_level,
          documentUrls: savedFiles,
          statusRegistration: "PENDING_VERIFICATION",
          paymentStatus: "UNPAID",
        },
      });

      set.status = 201;
      return { message: "Pendaftaran berhasil diajukan", id: registrant.id };
    }
  )
  .get(
    "/list",
    async ({ jwt, set, headers, query }) => {
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
        where: query.batch_id ? { batchId: query.batch_id as string } : undefined,
        include: {
          user: { select: { name: true, email: true, phoneNumber: true } },
          batch: { select: { batchName: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return registrants;
    }
  )
  .patch(
    "/:id/status",
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

      const { status, rejection_reason } = body as { status: string; rejection_reason?: string };
      const validStatuses = ["APPROVED", "REJECTED", "PENDING_VERIFICATION"];
      if (!validStatuses.includes(status)) {
        set.status = 400;
        return { error: "Status tidak valid" };
      }

      const updated = await prisma.registrant.update({
        where: { id: params.id },
        data: { statusRegistration: status },
        include: {
          user: { select: { name: true, phoneNumber: true } },
          batch: { select: { batchName: true } },
        },
      });

      const phone = updated.user.phoneNumber;
      if (status === "APPROVED") {
        await waService.sendMessage(
          phone,
          `Halo ${updated.user.name},\n\n✅ Pendaftaran Anda pada *${updated.batch.batchName}* telah *DISETUJUI*.\n\nSilakan lakukan pembayaran sesuai invoice yang akan dikirimkan.\n\n_STMS - Security Training Management System_`
        );
      } else if (status === "REJECTED") {
        await waService.sendMessage(
          phone,
          `Halo ${updated.user.name},\n\n❌ Maaf, pendaftaran Anda pada *${updated.batch.batchName}* *DITOLAK*.\n\nAlasan: ${rejection_reason || "Dokumen tidak memenuhi syarat"}.\n\nSilakan hubungi Admin untuk informasi lebih lanjut.\n\n_STMS - Security Training Management System_`
        );
      }

      return { message: "Status pendaftaran diperbarui", data: updated };
    }
  )
  .get(
    "/batches",
    async () => {
      const batches = await prisma.trainingBatch.findMany({
        where: { status: { in: ["OPEN", "ONGOING"] } },
        orderBy: { startDate: "asc" },
      });
      return batches;
    }
  );
