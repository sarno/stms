import Elysia from "elysia";
import prisma from "../../shared/db";
import bcrypt from "bcryptjs";

export const batchRoutes = new Elysia({ prefix: "/api/v1/batches" })
  .get("/", async ({ jwt, set, headers, query }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) { set.status = 401; return { error: "Token tidak valid" }; }

    const batches = await prisma.trainingBatch.findMany({
      include: {
        _count: { select: { registrants: true } },
        registrants: {
          where: { grade: { finalStatus: "LULUS" } },
          select: { id: true },
        },
      },
      orderBy: { startDate: "desc" },
    });
    return batches.map((b) => ({
      ...b,
      graduatesCount: b.registrants.length,
      registrants: undefined,
    }));
  })
  .post("/", async ({ body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const { batch_name, type, start_date, end_date, quota, status } = body as any;
    const batch = await prisma.trainingBatch.create({
      data: {
        batchName: batch_name,
        type: type || "Satpam Umum",
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        quota: parseInt(quota),
        status: status || "OPEN",
      },
    });
    set.status = 201;
    return batch;
  })
  .put("/:id", async ({ params, body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const { batch_name, type, start_date, end_date, quota, status } = body as any;
    const batch = await prisma.trainingBatch.update({
      where: { id: params.id },
      data: {
        batchName: batch_name,
        type: type || "Satpam Umum",
        startDate: new Date(start_date),
        endDate: new Date(end_date),
        quota: parseInt(quota),
        status,
      },
    });
    return batch;
  })
  .delete("/:id", async ({ params, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const existing = await prisma.trainingBatch.findUnique({ where: { id: params.id }, include: { _count: { select: { registrants: true } } } });
    if (!existing) { set.status = 404; return { error: "Angkatan tidak ditemukan" }; }
    if (existing._count.registrants > 0) { set.status = 400; return { error: "Angkatan memiliki peserta terdaftar, tidak dapat dihapus" }; }

    await prisma.trainingBatch.delete({ where: { id: params.id } });
    return { message: "Angkatan berhasil dihapus" };
  });

export const userRoutes = new Elysia({ prefix: "/api/v1/users" })
  .get("/", async ({ jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, phoneNumber: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return users;
  })
  .post("/", async ({ body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const { name, email, password, role, phone_number } = body as any;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { set.status = 409; return { error: "Email sudah terdaftar" }; }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role, phoneNumber: phone_number },
      select: { id: true, name: true, email: true, role: true, phoneNumber: true, createdAt: true },
    });
    set.status = 201;
    return user;
  })
  .put("/:id", async ({ params, body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const { name, email, role, phone_number, password } = body as any;
    const updateData: any = { name, email, role, phoneNumber: phone_number };
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, phoneNumber: true, createdAt: true },
    });
    return user;
  })
  .delete("/:id", async ({ params, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    if (params.id === payload.sub) { set.status = 400; return { error: "Tidak dapat menghapus akun sendiri" }; }
    await prisma.user.delete({ where: { id: params.id } });
    return { message: "User berhasil dihapus" };
  });

export const auditRoutes = new Elysia({ prefix: "/api/v1/audit-logs" })
  .get("/", async ({ jwt, set, headers, query }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || !["ADMIN_PUSDIKLAT", "POLDA_VERIFICATOR"].includes(payload.role as string)) { set.status = 403; return { error: "Akses ditolak" }; }

    const logs = await prisma.auditTrail.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return logs;
  });
