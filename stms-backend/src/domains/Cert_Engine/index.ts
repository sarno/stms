import Elysia from "elysia";
import prisma from "../../shared/db";
import { createHash } from "crypto";
import { join } from "path";
import { mkdir } from "fs/promises";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { PDFDocument } from "pdf-lib";
import { waService } from "../../shared/whatsapp";

const CERT_DIR = join(process.cwd(), "storage", "secure_certs");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function generateCertificatePDF(data: {
  candidateName: string;
  batchName: string;
  certificateNumber: string;
  verificationToken: string;
  issuedAt: Date;
}): Promise<string> {
  await mkdir(CERT_DIR, { recursive: true });

  const verifyUrl = `${BASE_URL}/verify/${data.verificationToken}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 150, margin: 1 });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 297mm; height: 210mm;
      font-family: 'Times New Roman', serif;
      background: #fff;
      display: flex; align-items: center; justify-content: center;
    }
    .cert {
      width: 100%; height: 100%;
      border: 12px solid #1a3a5c;
      padding: 30px 50px;
      position: relative;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center;
    }
    .cert::before {
      content: '';
      position: absolute; inset: 18px;
      border: 2px solid #c9a84c;
      pointer-events: none;
    }
    .logo { font-size: 14px; font-weight: bold; color: #1a3a5c; letter-spacing: 3px; margin-bottom: 6px; }
    .title { font-size: 36px; font-weight: bold; color: #1a3a5c; margin: 16px 0 8px; letter-spacing: 2px; }
    .subtitle { font-size: 14px; color: #555; margin-bottom: 24px; }
    .recipient-label { font-size: 13px; color: #777; }
    .recipient-name { font-size: 32px; font-weight: bold; color: #1a3a5c; border-bottom: 2px solid #c9a84c; padding-bottom: 6px; margin: 8px 0 12px; }
    .desc { font-size: 13px; color: #444; line-height: 1.8; max-width: 500px; }
    .batch { font-size: 15px; font-weight: bold; color: #1a3a5c; margin: 8px 0; }
    .cert-number { font-size: 11px; color: #888; margin-top: 20px; }
    .qr { position: absolute; bottom: 28px; right: 40px; text-align: center; }
    .qr img { width: 80px; height: 80px; }
    .qr p { font-size: 8px; color: #aaa; margin-top: 3px; }
    .date { font-size: 12px; color: #666; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="logo">DITBINMAS POLDA</div>
    <div class="title">IJAZAH</div>
    <div class="subtitle">Security Training Management System</div>
    <div class="recipient-label">Diberikan kepada</div>
    <div class="recipient-name">${data.candidateName}</div>
    <div class="desc">Telah berhasil menyelesaikan pendidikan dan pelatihan pada</div>
    <div class="batch">${data.batchName}</div>
    <div class="desc">dengan predikat <strong>LULUS</strong> dan dinyatakan memenuhi kompetensi sebagai tenaga keamanan profesional.</div>
    <div class="date">Diterbitkan: ${new Date(data.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
    <div class="cert-number">No. Ijazah: ${data.certificateNumber}</div>
    <div class="qr">
      <img src="${qrDataUrl}" />
      <p>Scan untuk verifikasi</p>
    </div>
  </div>
</body>
</html>`;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const filename = `cert_${data.verificationToken}.pdf`;
  const filepath = join(CERT_DIR, filename);

  await page.pdf({
    path: filepath,
    format: "A4",
    landscape: true,
    printBackground: true,
  });

  await browser.close();
  return filepath;
}

export const certRoutes = new Elysia({ prefix: "/api/v1/certificates" })
  .post(
    "/issue",
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

      const registrant = await prisma.registrant.findUnique({
        where: { id: registrant_id },
        include: {
          user: { select: { name: true, phoneNumber: true } },
          batch: { select: { batchName: true } },
          grade: true,
          certificate: true,
        },
      });

      if (!registrant) {
        set.status = 404;
        return { error: "Peserta tidak ditemukan" };
      }

      if (registrant.grade?.finalStatus !== "LULUS") {
        set.status = 400;
        return { error: "Peserta belum dinyatakan LULUS" };
      }

      if (registrant.certificate) {
        set.status = 409;
        return { error: "Ijazah sudah diterbitkan sebelumnya" };
      }

      const verificationToken = createHash("sha256")
        .update(`${registrant_id}-${certificate_number}-${Date.now()}`)
        .digest("hex");

      const issuedAt = new Date();
      const filePath = await generateCertificatePDF({
        candidateName: registrant.user.name,
        batchName: registrant.batch.batchName,
        certificateNumber: certificate_number,
        verificationToken,
        issuedAt,
      });

      const certificate = await prisma.certificate.create({
        data: {
          registrantId: registrant_id,
          certificateNumber: certificate_number,
          verificationToken,
          filePath,
          issuedAt,
          poldaApproverId: payload.sub as string,
        },
      });

      await prisma.auditTrail.create({
        data: {
          userId: payload.sub as string,
          action: "ISSUE_CERTIFICATE",
          tableName: "certificates",
          afterData: { registrant_id, certificate_number, verificationToken },
          ipAddress: headers["x-forwarded-for"] as string || "unknown",
        },
      });

      await waService.sendMessage(
        registrant.user.phoneNumber,
        `Selamat ${registrant.user.name}! 🎓\n\nIjazah Anda pada *${registrant.batch.batchName}* telah resmi diterbitkan.\n\n📄 No. Ijazah: *${certificate_number}*\n🔗 Verifikasi: ${BASE_URL}/verify/${verificationToken}\n\n_STMS - Security Training Management System_`
      );

      set.status = 201;
      return {
        message: "Ijazah digital berhasil diterbitkan",
        download_url: `/api/v1/certificates/download/${certificate.id}`,
        verification_url: `/verify/${verificationToken}`,
      };
    }
  )
  .get(
    "/download/:id",
    async ({ params, jwt, set, headers }) => {
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

      const cert = await prisma.certificate.findUnique({
        where: { id: params.id },
        include: { registrant: { select: { userId: true } } },
      });

      if (!cert) {
        set.status = 404;
        return { error: "Ijazah tidak ditemukan" };
      }

      if (
        payload.role === "PESERTA" &&
        cert.registrant.userId !== (payload.sub as string)
      ) {
        set.status = 403;
        return { error: "Forbidden: Anda tidak berhak mengunduh ijazah ini" };
      }

      const file = Bun.file(cert.filePath);
      const exists = await file.exists();
      if (!exists) {
        set.status = 404;
        return { error: "File tidak ditemukan di server" };
      }

      return new Response(file, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="ijazah_${cert.certificateNumber}.pdf"`,
        },
      });
    }
  );

export const certificateListRoutes = new Elysia({ prefix: "/api/v1/certificates" })
  .get("/list", async ({ jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) { set.status = 401; return { error: "Token tidak valid" }; }

    const certs = await prisma.certificate.findMany({
      include: {
        registrant: {
          include: {
            user: { select: { name: true } },
            batch: { select: { batchName: true } },
          },
        },
        poldaApprover: { select: { name: true } },
      },
      orderBy: { issuedAt: "desc" },
    });

    return certs.map(c => ({
      id: c.id,
      certNo: c.certificateNumber,
      participant: c.registrant.user.name,
      batch: c.registrant.batch.batchName,
      issueDate: c.issuedAt,
      verificationToken: c.verificationToken,
      filePath: c.filePath,
      approver: c.poldaApprover.name,
    }));
  });

export const graduationRoutes = new Elysia({ prefix: "/api/v1/graduation" })
  .post("/approve", async ({ body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || !["ADMIN_PUSDIKLAT", "POLDA_VERIFICATOR"].includes(payload.role as string)) {
      set.status = 403; return { error: "Akses ditolak" };
    }

    const { registrant_ids } = body as { registrant_ids: string[] };

    await Promise.all(registrant_ids.map(id =>
      prisma.grade.updateMany({
        where: { registrantId: id },
        data: { finalStatus: "LULUS" },
      })
    ));

    await prisma.auditTrail.create({
      data: {
        userId: payload.sub as string,
        action: "APPROVE_GRADUATION",
        tableName: "grades",
        afterData: { approved_count: registrant_ids.length, registrant_ids },
        ipAddress: headers["x-forwarded-for"] as string || "unknown",
      },
    });

    return { message: `${registrant_ids.length} peserta berhasil diluluskan` };
  });

export const waStatusRoutes = new Elysia({ prefix: "/api/v1/wa" })
  .get("/status", async ({ jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) { set.status = 401; return { error: "Token tidak valid" }; }

    return {
      connected: waService.getStatus(),
      message: waService.getStatus() ? "WhatsApp terhubung" : "WhatsApp tidak terhubung — scan QR Code di log server",
    };
  });

export const verificationRoutes = new Elysia({ prefix: "/api/v1/verify" })
  .get("/:token", async ({ params, set }) => {
    const cert = await prisma.certificate.findUnique({
      where: { verificationToken: params.token },
      include: {
        registrant: {
          include: {
            user: { select: { name: true } },
            batch: { select: { batchName: true } },
          },
        },
      },
    });

    if (!cert) {
      set.status = 404;
      return { valid: false, error: "Token verifikasi tidak valid" };
    }

    return {
      valid: true,
      data: {
        candidate_name: cert.registrant.user.name,
        batch_name: cert.registrant.batch.batchName,
        certificate_number: cert.certificateNumber,
        issued_at: cert.issuedAt,
        status: "TERVERIFIKASI DI DITBINMAS POLDA",
      },
    };
  });
