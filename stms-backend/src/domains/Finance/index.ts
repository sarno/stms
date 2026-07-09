import Elysia from "elysia";
import prisma from "../../shared/db";

function verifyJwt(jwt: any, headers: Record<string, string | undefined>) {
  const authHeader = headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) return null;
  return jwt.verify(authHeader.slice(7));
}

export const financeRoutes = new Elysia({ prefix: "/api/v1/finance" })
  // ─── Service Rates ──────────────────────────────────────────────────────────
  .get("/rates", async ({ jwt, set, headers }) => {
    const payload = await verifyJwt(jwt, headers);
    if (!payload) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const rates = await prisma.serviceRate.findMany({ orderBy: { createdAt: "desc" } });
    return rates.map(r => ({ ...r, amount: Number(r.amount) }));
  })
  .post("/rates", async ({ jwt, set, headers, body }) => {
    const payload = await verifyJwt(jwt, headers);
    if (!payload) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const { trainingType, amount, description } = body as any;
    if (!trainingType || !amount) { set.status = 400; return { error: "trainingType dan amount wajib diisi" }; }
    const existing = await prisma.serviceRate.findUnique({ where: { trainingType } });
    if (existing) { set.status = 409; return { error: "Tarif untuk jenis pelatihan ini sudah ada" }; }
    const rate = await prisma.serviceRate.create({
      data: { trainingType, amount: Number(amount), description: description || null },
    });
    return { ...rate, amount: Number(rate.amount) };
  })
  .put("/rates/:id", async ({ jwt, set, headers, params, body }) => {
    const payload = await verifyJwt(jwt, headers);
    if (!payload) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const { trainingType, amount, description, isActive } = body as any;
    const data: any = {};
    if (trainingType !== undefined) data.trainingType = trainingType;
    if (amount !== undefined) data.amount = Number(amount);
    if (description !== undefined) data.description = description;
    if (isActive !== undefined) data.isActive = isActive;
    const rate = await prisma.serviceRate.update({ where: { id: params.id }, data });
    return { ...rate, amount: Number(rate.amount) };
  })
  .delete("/rates/:id", async ({ jwt, set, headers, params }) => {
    const payload = await verifyJwt(jwt, headers);
    if (!payload) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    await prisma.serviceRate.delete({ where: { id: params.id } });
    return { success: true };
  })
  // ─── Payments ──────────────────────────────────────────────────────────────
  .get("/payments", async ({ jwt, set, headers, query }) => {
    const payload = await verifyJwt(jwt, headers);
    if (!payload) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const { search, paymentStatus, batchId } = query as any;
    const where: any = {};
    if (paymentStatus && paymentStatus !== "ALL") where.paymentStatus = paymentStatus;
    if (batchId) where.batchId = batchId;
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { ktpNumber: { contains: search } },
      ];
    }
    const payments = await prisma.registrant.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        batch: { select: { batchName: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return payments.map(p => ({
      id: p.id,
      name: p.user.name,
      email: p.user.email,
      batchName: p.batch.batchName,
      trainingType: p.batch.type,
      ktpNumber: p.ktpNumber,
      paymentStatus: p.paymentStatus,
      paymentAmount: p.paymentAmount ? Number(p.paymentAmount) : null,
      paymentDate: p.paymentDate,
      paymentNote: p.paymentNote,
      statusRegistration: p.statusRegistration,
      createdAt: p.createdAt,
    }));
  })
  .patch("/payments/:id/verify", async ({ jwt, set, headers, params, body }) => {
    const payload = await verifyJwt(jwt, headers);
    if (!payload) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const { paymentStatus, paymentAmount, paymentNote } = body as any;
    if (!paymentStatus) { set.status = 400; return { error: "paymentStatus wajib diisi" }; }
    if (!["UNPAID", "PARTIAL", "PAID"].includes(paymentStatus)) { set.status = 400; return { error: "Status pembayaran tidak valid" }; }
    const data: any = { paymentStatus };
    if (paymentAmount !== undefined) data.paymentAmount = Number(paymentAmount);
    if (paymentNote !== undefined) data.paymentNote = paymentNote;
    if (paymentStatus === "PAID" || paymentStatus === "PARTIAL") data.paymentDate = new Date();
    if (paymentStatus === "UNPAID") { data.paymentAmount = null; data.paymentDate = null; data.paymentNote = null; }
    const reg = await prisma.registrant.update({ where: { id: params.id }, data });
    await prisma.auditTrail.create({
      data: {
        userId: (payload as any).id || "",
        action: "VERIFY_PAYMENT",
        tableName: "registrants",
        afterData: { registrantId: params.id, paymentStatus, paymentAmount: paymentAmount || null },
      },
    });
    return {
      id: reg.id,
      paymentStatus: reg.paymentStatus,
      paymentAmount: reg.paymentAmount ? Number(reg.paymentAmount) : null,
      paymentDate: reg.paymentDate,
      paymentNote: reg.paymentNote,
    };
  });
