import Elysia from "elysia";
import prisma from "../../shared/db";

export const roleRoutes = new Elysia({ prefix: "/api/v1/roles" })
  .get("/", async ({ jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) { set.status = 401; return { error: "Token tidak valid" }; }

    const [roles, userCounts] = await Promise.all([
      prisma.role.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    ]);
    const countMap = new Map(userCounts.map(u => [u.role, u._count.role]));

    return roles.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description || "",
      permissions: r.permissions as string[],
      permCount: (r.permissions as string[]).length,
      userCount: countMap.get(r.name) || countMap.get(r.id) || 0,
      isActive: r.isActive,
      icon: "Shield",
    }));
  })
  .post("/", async ({ jwt, set, headers, body }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || (payload as any).role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }
    const { name, description, permissions } = body as any;
    if (!name) { set.status = 400; return { error: "Nama role wajib diisi" }; }
    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) { set.status = 409; return { error: "Role sudah ada" }; }
    const role = await prisma.role.create({
      data: { name, description: description || null, permissions: permissions || [] },
    });
    return { id: role.id, name: role.name, description: role.description, permissions: role.permissions as string[] };
  })
  .put("/:id", async ({ jwt, set, headers, params, body }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || (payload as any).role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }
    const { name, description, permissions, isActive } = body as any;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (permissions !== undefined) data.permissions = permissions;
    if (isActive !== undefined) data.isActive = isActive;
    const role = await prisma.role.update({ where: { id: params.id }, data });
    return { id: role.id, name: role.name, description: role.description, permissions: role.permissions as string[], isActive: role.isActive };
  })
  .delete("/:id", async ({ jwt, set, headers, params }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || (payload as any).role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }
    const userCount = await prisma.user.count({ where: { role: (await prisma.role.findUnique({ where: { id: params.id } }))?.name || "" } });
    if (userCount > 0) { set.status = 400; return { error: `Tidak dapat menghapus role yang masih memiliki ${userCount} pengguna` }; }
    await prisma.role.delete({ where: { id: params.id } });
    return { success: true };
  })
  .get("/permissions", async ({ jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) { set.status = 401; return { error: "Token tidak valid" }; }
    const allPermissions = [
      { key: "dashboard.view", label: "Dashboard" },
      { key: "masterdata.manage", label: "Master Data" },
      { key: "participant.manage", label: "Kelola Peserta" },
      { key: "participant.view", label: "Lihat Peserta" },
      { key: "registration.manage", label: "Pendaftaran" },
      { key: "registration.apply", label: "Daftar Pelatihan" },
      { key: "document.verify", label: "Verifikasi Dokumen" },
      { key: "batch.manage", label: "Angkatan" },
      { key: "batch.view", label: "Lihat Angkatan" },
      { key: "schedule.manage", label: "Jadwal" },
      { key: "schedule.view", label: "Lihat Jadwal" },
      { key: "attendance.manage", label: "Absensi" },
      { key: "attendance.write", label: "Input Absensi" },
      { key: "grade.manage", label: "Nilai" },
      { key: "grade.view", label: "Lihat Nilai" },
      { key: "grade.approve", label: "Approve Nilai" },
      { key: "graduation.manage", label: "Kelulusan" },
      { key: "graduation.approve", label: "Approve Kelulusan" },
      { key: "certificate.manage", label: "Sertifikat" },
      { key: "certificate.issue", label: "Terbitkan Sertifikat" },
      { key: "certificate.view", label: "Lihat Sertifikat" },
      { key: "verification.view", label: "Verifikasi Publik" },
      { key: "finance.rates", label: "Tarif Layanan" },
      { key: "finance.payments", label: "Verifikasi Bayar" },
      { key: "finance.reports", label: "Lap. Keuangan" },
      { key: "report.view", label: "Laporan" },
      { key: "user.manage", label: "Kelola Pengguna" },
      { key: "role.view", label: "Peran & Akses" },
      { key: "audit.view", label: "Audit Log" },
      { key: "setting.manage", label: "Pengaturan" },
    ];
    return allPermissions;
  });
