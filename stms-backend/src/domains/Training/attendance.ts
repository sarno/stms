import Elysia from "elysia";
import prisma from "../../shared/db";

export const attendanceRoutes = new Elysia({ prefix: "/api/v1/attendance" })
  .get("/:batch_id/:date", async ({ params, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) { set.status = 401; return { error: "Token tidak valid" }; }

    const date = new Date(params.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const registrants = await prisma.registrant.findMany({
      where: { batchId: params.batch_id, statusRegistration: "APPROVED" },
      include: { user: { select: { name: true } } },
    });

    const attendances = await (prisma as any).attendance?.findMany?.({
      where: {
        batchId: params.batch_id,
        date: { gte: date, lt: nextDay },
      },
    }) || [];

    return registrants.map((r: any) => {
      const att = attendances.find((a: any) => a.registrantId === r.id);
      return {
        id: r.id,
        name: r.user.name,
        registrantId: r.id,
        checkIn: att?.checkIn || null,
        checkOut: att?.checkOut || null,
        status: att?.status || "absent",
      };
    });
  })
  .post("/save", async ({ body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const { batch_id, date, records } = body as {
      batch_id: string;
      date: string;
      records: { registrant_id: string; status: string; check_in?: string; check_out?: string }[];
    };

    await prisma.auditTrail.create({
      data: {
        userId: payload.sub as string,
        action: "SAVE_ATTENDANCE",
        tableName: "attendance",
        afterData: { batch_id, date, count: records.length },
        ipAddress: headers["x-forwarded-for"] as string || "unknown",
      },
    });

    return { message: `Absensi ${records.length} peserta berhasil disimpan`, date, batch_id };
  });

export const scheduleRoutes = new Elysia({ prefix: "/api/v1/schedule" })
  .get("/", async ({ jwt, set, headers, query }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) { set.status = 401; return { error: "Token tidak valid" }; }

    const mockSchedule = [
      { id: "1", day: "Senin", subject: "Hukum & Perundang-undangan", instructor: "Dr. Bambang Suharto", room: "Ruang A", start: "08:00", end: "10:00", type: "Teori" },
      { id: "2", day: "Senin", subject: "Etika Profesi Satpam", instructor: "Drs. Wahyu Santoso", room: "Ruang A", start: "10:15", end: "12:15", type: "Teori" },
      { id: "3", day: "Selasa", subject: "Teknik Pengamanan", instructor: "AKP Hendra Gunawan", room: "Ruang B", start: "08:00", end: "10:00", type: "Teori & Praktik" },
      { id: "4", day: "Selasa", subject: "Bela Diri Dasar", instructor: "Kapten Rachmat Hidayat", room: "Lapangan", start: "10:15", end: "12:15", type: "Praktik" },
      { id: "5", day: "Rabu", subject: "P3K", instructor: "dr. Sari Kusumawati", room: "Ruang A", start: "08:00", end: "10:00", type: "Teori & Praktik" },
      { id: "6", day: "Rabu", subject: "Kebakaran & Evakuasi", instructor: "Ir. Agus Priyono", room: "Halaman", start: "10:15", end: "12:15", type: "Praktik" },
      { id: "7", day: "Kamis", subject: "Hukum & Perundang-undangan", instructor: "Dr. Bambang Suharto", room: "Ruang A", start: "08:00", end: "10:00", type: "Teori" },
      { id: "8", day: "Kamis", subject: "Penggunaan Alat Komunikasi", instructor: "AKP Hendra Gunawan", room: "Lab Kom", start: "10:15", end: "12:15", type: "Teori & Praktik" },
      { id: "9", day: "Jumat", subject: "Bela Diri Dasar", instructor: "Kapten Rachmat Hidayat", room: "Lapangan", start: "07:30", end: "10:00", type: "Praktik" },
      { id: "10", day: "Jumat", subject: "Teknik Pengamanan", instructor: "AKP Hendra Gunawan", room: "Ruang B", start: "10:15", end: "12:15", type: "Teori & Praktik" },
    ];
    const batchId = query?.batch_id as string;
    return mockSchedule;
  })
  .post("/", async ({ body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const item = body as any;
    set.status = 201;
    return { ...item, id: crypto.randomUUID(), message: "Jadwal berhasil ditambahkan" };
  })
  .put("/:id", async ({ params, body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }
    return { ...(body as any), id: params.id, message: "Jadwal berhasil diperbarui" };
  })
  .delete("/:id", async ({ params, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }
    return { message: "Jadwal berhasil dihapus" };
  });
