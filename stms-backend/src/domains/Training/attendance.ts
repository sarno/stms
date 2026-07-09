import Elysia from "elysia";
import prisma from "../../shared/db";

export const attendanceRoutes = new Elysia({ prefix: "/api/v1/attendance" })
  .get("/:batch_id/:date", async ({ params, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) { set.status = 401; return { error: "Token tidak valid" }; }

    const date = new Date(params.date as string);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const registrants = await prisma.registrant.findMany({
      where: { batchId: params.batch_id, statusRegistration: "APPROVED" },
      include: { user: { select: { name: true } } },
    });

    const existing = await prisma.attendance.findMany({
      where: {
        batchId: params.batch_id,
        date: { gte: date, lt: nextDay },
      },
    });

    return registrants.map((r, idx) => {
      const att = existing.find(a => a.registrantId === r.id);
      return {
        id: idx + 1,
        registrantId: r.id,
        name: r.user.name,
        regNo: `REG-${String(r.id).slice(0, 8).toUpperCase()}`,
        checkIn: att?.checkIn || null,
        checkOut: att?.checkOut || null,
        status: att?.status || "ABSENT",
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

    const dt = new Date(date as string);

    for (const r of records) {
      await prisma.attendance.upsert({
        where: {
          registrantId_batchId_date: {
            registrantId: r.registrant_id,
            batchId: batch_id,
            date: dt,
          },
        },
        create: {
          registrantId: r.registrant_id,
          batchId: batch_id,
          date: dt,
          status: r.status,
          checkIn: r.check_in || null,
          checkOut: r.check_out || null,
        },
        update: {
          status: r.status,
          checkIn: r.check_in || null,
          checkOut: r.check_out || null,
        },
      });
    }

    await prisma.auditTrail.create({
      data: {
        userId: payload.sub as string,
        action: "SAVE_ATTENDANCE",
        tableName: "attendance",
        afterData: { batch_id, date, count: records.length },
        ipAddress: (headers as any)["x-forwarded-for"] || "unknown",
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

    const where = query?.batch_id ? { batchId: query.batch_id as string } : {};
    const items = await prisma.schedule.findMany({
      where,
      orderBy: [{ day: "asc" }, { start: "asc" }],
    });
    return items;
  })
  .post("/", async ({ body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const { batch_id, day, subject, instructor, room, start, end, type, week } = body as any;
    const item = await prisma.schedule.create({
      data: {
        batchId: batch_id,
        day,
        subject,
        instructor,
        room,
        start,
        end,
        type: type || "Teori",
        week: week ? parseInt(week) : null,
      },
    });
    set.status = 201;
    return { ...item, message: "Jadwal berhasil ditambahkan" };
  })
  .put("/:id", async ({ params, body, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    const { day, subject, instructor, room, start, end, type, week } = body as any;
    const item = await prisma.schedule.update({
      where: { id: params.id },
      data: {
        ...(day ? { day } : {}),
        ...(subject ? { subject } : {}),
        ...(instructor ? { instructor } : {}),
        ...(room ? { room } : {}),
        ...(start ? { start } : {}),
        ...(end ? { end } : {}),
        ...(type ? { type } : {}),
        ...(week !== undefined ? { week: parseInt(week) } : {}),
      },
    });
    return { ...item, message: "Jadwal berhasil diperbarui" };
  })
  .delete("/:id", async ({ params, jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) { set.status = 401; return { error: "Token tidak ditemukan" }; }
    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload || payload.role !== "ADMIN_PUSDIKLAT") { set.status = 403; return { error: "Akses ditolak" }; }

    await prisma.schedule.delete({ where: { id: params.id } });
    return { message: "Jadwal berhasil dihapus" };
  });
