import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding STMS database...");

  // ─── USERS ────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@stms.id" },
    update: {},
    create: { name: "Admin Sistem", email: "admin@stms.id", passwordHash: hash, phoneNumber: "081234567890", role: "ADMIN_PUSDIKLAT" },
  });
  const polda = await prisma.user.upsert({
    where: { email: "polda@stms.id" },
    update: {},
    create: { name: "Verifikator Polda", email: "polda@stms.id", passwordHash: hash, phoneNumber: "081234567891", role: "POLDA_VERIFICATOR" },
  });
  const operator = await prisma.user.upsert({
    where: { email: "operator@stms.id" },
    update: {},
    create: { name: "Bimo Prasetyo", email: "operator@stms.id", passwordHash: hash, phoneNumber: "081234567892", role: "ADMIN_PUSDIKLAT" },
  });

  // Peserta users
  const pesertaData = [
    { name: "Ahmad Fauzi Rahmanto", email: "ahmad.fauzi@peserta.id", phone: "081234567001" },
    { name: "Siti Nurhaliza Putri", email: "siti.nurhaliza@peserta.id", phone: "082345678001" },
    { name: "Budi Santoso Wibowo", email: "budi.santoso@peserta.id", phone: "083456789001" },
    { name: "Dewi Rahayu Kusuma", email: "dewi.rahayu@peserta.id", phone: "084567890001" },
    { name: "Eko Prasetyo Nugroho", email: "eko.prasetyo@peserta.id", phone: "085678901001" },
    { name: "Fitri Anggraeni Sari", email: "fitri.anggraeni@peserta.id", phone: "086789012001" },
    { name: "Gunawan Setiawan", email: "gunawan.setiawan@peserta.id", phone: "087890123001" },
    { name: "Hana Pertiwi Lestari", email: "hana.pertiwi@peserta.id", phone: "088901234001" },
    { name: "Rudi Hartono Putra", email: "rudi.hartono@peserta.id", phone: "089012345001" },
    { name: "Maya Sari Dewanti", email: "maya.sari@peserta.id", phone: "081123456001" },
    { name: "Irwan Setiabudi", email: "irwan.setiabudi@peserta.id", phone: "082234567001" },
    { name: "Lena Wulandari", email: "lena.wulandari@peserta.id", phone: "083345678001" },
  ];

  const pesertaUsers = await Promise.all(
    pesertaData.map(p =>
      prisma.user.upsert({
        where: { email: p.email },
        update: {},
        create: { name: p.name, email: p.email, passwordHash: hash, phoneNumber: p.phone, role: "PESERTA" },
      })
    )
  );

  console.log(`✅ Users: ${pesertaUsers.length + 3} created`);

  // ─── TRAINING BATCHES ─────────────────────────────────────────────────────
  const batch1 = await prisma.trainingBatch.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000001", batchName: "Gada Pratama Angkatan 001/2024", type: "Satpam Umum", startDate: new Date("2024-01-08"), endDate: new Date("2024-02-16"), quota: 40, status: "COMPLETED" },
  });
  const batch2 = await prisma.trainingBatch.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000002", batchName: "Gada Pratama Angkatan 002/2024", type: "Satpam Umum", startDate: new Date("2024-03-04"), endDate: new Date("2024-04-12"), quota: 40, status: "COMPLETED" },
  });
  const batch3 = await prisma.trainingBatch.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000003", batchName: "Gada Madya Angkatan 003/2024", type: "Gada Madya", startDate: new Date("2024-06-03"), endDate: new Date("2024-07-12"), quota: 30, status: "ONGOING" },
  });
  const batch4 = await prisma.trainingBatch.upsert({
    where: { id: "00000000-0000-0000-0000-000000000004" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000004", batchName: "Gada Utama Angkatan 004/2024", type: "Satpam VIP", startDate: new Date("2024-09-02"), endDate: new Date("2024-10-11"), quota: 35, status: "OPEN" },
  });

  console.log("✅ Training Batches: 4 created");

  // ─── SERVICE RATES ─────────────────────────────────────────────────────────
  const rateData = [
    { trainingType: "Satpam Umum", amount: 1500000, description: "Tarif Gada Pratama" },
    { trainingType: "Gada Madya", amount: 2000000, description: "Tarif Gada Madya" },
    { trainingType: "Satpam VIP", amount: 2500000, description: "Tarif Satpam VIP / Gada Utama" },
  ];

  for (const r of rateData) {
    await prisma.serviceRate.upsert({
      where: { trainingType: r.trainingType },
      update: { amount: r.amount, description: r.description },
      create: r,
    });
  }
  const rateMap = new Map(rateData.map(r => [r.trainingType, r.amount]));
  console.log("✅ Service Rates: 3 created");

  // ─── ROLES ─────────────────────────────────────────────────────────────────
  const roleSeed = [
    { name: "ADMIN_PUSDIKLAT", description: "Akses penuh ke seluruh fitur dan konfigurasi sistem termasuk manajemen pengguna dan audit log.", permissions: ["dashboard.view","masterdata.manage","participant.manage","registration.manage","document.verify","batch.manage","schedule.manage","attendance.manage","grade.manage","graduation.manage","certificate.manage","verification.view","finance.rates","finance.payments","finance.reports","report.view","user.manage","role.view","audit.view","setting.manage"] },
    { name: "POLDA_VERIFICATOR", description: "Verifikasi data kelulusan, approve sertifikat, dan memantau data peserta dari tingkat Polda.", permissions: ["dashboard.view","participant.view","batch.view","grade.approve","graduation.approve","certificate.issue","verification.view","audit.view"] },
    { name: "PESERTA", description: "Akses terbatas untuk melihat data diri, mendaftar pelatihan, jadwal, nilai, dan status sertifikat.", permissions: ["dashboard.view","registration.apply","schedule.view","grade.view","certificate.view","verification.view"] },
  ];
  for (const r of roleSeed) {
    await prisma.role.upsert({ where: { name: r.name }, update: r, create: r });
  }
  console.log("✅ Roles: 3 created");

  // ─── REGISTRANTS ──────────────────────────────────────────────────────────
  const registrantConfigs = [
    // ANG-001 (COMPLETED, type "Satpam Umum") — peserta 6,7
    { userIdx: 6, batch: batch1, ktp: "3274011507860007", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", paymentDate: new Date("2024-01-05"), docs: { ktp: "/storage/uploads/ktp_007.jpg", skck: "/storage/uploads/skck_007.pdf", foto: "/storage/uploads/foto_007.jpg" } },
    // ANG-002 (COMPLETED, type "Satpam Umum") — peserta 2,3
    { userIdx: 2, batch: batch2, ktp: "3274011203880003", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", paymentDate: new Date("2024-02-20"), docs: { ktp: "/storage/uploads/ktp_003.jpg", skck: "/storage/uploads/skck_003.pdf", foto: "/storage/uploads/foto_003.jpg" } },
    { userIdx: 3, batch: batch2, ktp: "3274014509910004", edu: "D3", status: "APPROVED", payment: "PAID", paymentDate: new Date("2024-02-21"), docs: { ktp: "/storage/uploads/ktp_004.jpg", skck: "/storage/uploads/skck_004.pdf", foto: "/storage/uploads/foto_004.jpg" } },
    // ANG-003 (ONGOING, type "Gada Madya")
    { userIdx: 0, batch: batch3, ktp: "3274011504890002", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", paymentDate: new Date("2024-05-20"), docs: { ktp: "/storage/uploads/ktp_001.jpg", skck: "/storage/uploads/skck_001.pdf", foto: "/storage/uploads/foto_001.jpg" } },
    { userIdx: 1, batch: batch3, ktp: "3274016708920001", edu: "S1", status: "APPROVED", payment: "PAID", paymentDate: new Date("2024-05-22"), docs: { ktp: "/storage/uploads/ktp_002.jpg", foto: "/storage/uploads/foto_002.jpg" } },
    { userIdx: 4, batch: batch3, ktp: "3274011012870005", edu: "SMA/SMK", status: "APPROVED", payment: "PARTIAL", paymentDate: new Date("2024-05-25"), docs: { ktp: "/storage/uploads/ktp_005.jpg", skck: "/storage/uploads/skck_005.pdf" } },
    { userIdx: 5, batch: batch3, ktp: "3274012801930006", edu: "D3", status: "APPROVED", payment: "PAID", paymentDate: new Date("2024-05-18"), docs: { ktp: "/storage/uploads/ktp_006.jpg", skck: "/storage/uploads/skck_006.pdf", foto: "/storage/uploads/foto_006.jpg" } },
    { userIdx: 8, batch: batch3, ktp: "3274011908950009", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", paymentDate: new Date("2024-05-19"), docs: { ktp: "/storage/uploads/ktp_009.jpg", skck: "/storage/uploads/skck_009.pdf", foto: "/storage/uploads/foto_009.jpg" } },
    { userIdx: 9, batch: batch3, ktp: "3274015503920010", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", paymentDate: new Date("2024-05-21"), docs: { ktp: "/storage/uploads/ktp_010.jpg", skck: "/storage/uploads/skck_010.pdf", foto: "/storage/uploads/foto_010.jpg" } },
    { userIdx: 10, batch: batch3, ktp: "3274011207890011", edu: "SMA/SMK", status: "APPROVED", payment: "PARTIAL", paymentDate: new Date("2024-06-01"), docs: { ktp: "/storage/uploads/ktp_011.jpg" } },
    { userIdx: 11, batch: batch3, ktp: "3274012904940012", edu: "D3", status: "APPROVED", payment: "PAID", paymentDate: new Date("2024-05-23"), docs: { ktp: "/storage/uploads/ktp_012.jpg", skck: "/storage/uploads/skck_012.pdf", foto: "/storage/uploads/foto_012.jpg" } },
    // ANG-004 (OPEN, type "Satpam VIP")
    { userIdx: 7, batch: batch4, ktp: "3274012203950008", edu: "SMA/SMK", status: "PENDING_VERIFICATION", payment: "UNPAID", paymentDate: null, docs: { ktp: "/storage/uploads/ktp_008.jpg" } },
  ];

  const registrants: any[] = [];
  for (const cfg of registrantConfigs) {
    const existing = await prisma.registrant.findFirst({
      where: { userId: pesertaUsers[cfg.userIdx].id, batchId: cfg.batch.id },
    });
    const batchType = cfg.batch.type;
    const baseAmount = rateMap.get(batchType) || 1500000;
    const amount = cfg.payment === "PAID" ? baseAmount : cfg.payment === "PARTIAL" ? Math.round(baseAmount * 0.5) : null;
    const data = {
      userId: pesertaUsers[cfg.userIdx].id,
      batchId: cfg.batch.id,
      ktpNumber: cfg.ktp,
      educationLevel: cfg.edu,
      documentUrls: cfg.docs,
      statusRegistration: cfg.status,
      paymentStatus: cfg.payment,
      paymentAmount: amount,
      paymentDate: cfg.paymentDate,
      paymentNote: cfg.payment === "PAID" ? "Lunas (transfer Bank BRI)" : cfg.payment === "PARTIAL" ? "DP 50% (tunai)" : null,
    };
    if (!existing) {
      const r = await prisma.registrant.create({ data });
      registrants.push(r);
    } else {
      await prisma.registrant.update({ where: { id: existing.id }, data });
      registrants.push(existing);
    }
  }

  console.log(`✅ Registrants: ${registrants.length} created`);

  // ─── GRADES ───────────────────────────────────────────────────────────────
  // Subject list from masterdata
  const subjectNames = [
    "Hukum & Perundang-undangan",
    "Etika Profesi Satpam",
    "Teknik Pengamanan",
    "Bela Diri Dasar",
    "P3K",
    "Kebakaran & Evakuasi",
    "Penggunaan Alat Komunikasi",
  ];

  // ANG-001 graduates (idx 0 = Gunawan)
  const gradeConfigs = [
    { regIdx: 0, theory: 88, physical: 82, special: 79 },   // Gunawan - LULUS
    { regIdx: 1, theory: 85, physical: 80, special: 82 },   // Budi - LULUS
    { regIdx: 2, theory: 90, physical: 88, special: 85 },   // Dewi - LULUS
    { regIdx: 3, theory: 78, physical: 80, special: 75 },   // Ahmad ANG-003 - LULUS
    { regIdx: 4, theory: 90, physical: 88, special: 85 },   // Siti - LULUS
    { regIdx: 5, theory: 72, physical: 68, special: 70 },   // Eko - TIDAK_LULUS
    { regIdx: 6, theory: 88, physical: 85, special: 90 },   // Fitri - LULUS
    { regIdx: 7, theory: 75, physical: 71, special: 73 },   // Rudi - LULUS
    { regIdx: 8, theory: 83, physical: 80, special: 82 },   // Maya - LULUS
    { regIdx: 9, theory: 65, physical: 60, special: 62 },   // Irwan - TIDAK_LULUS
    { regIdx: 10, theory: 81, physical: 77, special: 79 },  // Lena - LULUS
  ];

  for (const g of gradeConfigs) {
    const reg = registrants[g.regIdx];
    if (!reg) continue;
    const avg = (g.theory + g.physical + g.special) / 3;
    const finalStatus = avg >= 70 ? "LULUS" : "TIDAK_LULUS";
    // Generate random per-subject scores
    const subjectScores: Record<string, number> = {};
    for (const subj of subjectNames) {
      const base = Math.round((g.theory + g.physical + g.special) / 3);
      subjectScores[subj] = Math.max(0, Math.min(100, base + Math.round((Math.random() - 0.5) * 20)));
    }
    const existing = await prisma.grade.findUnique({ where: { registrantId: reg.id } });
    if (!existing) {
      await prisma.grade.create({
        data: {
          registrantId: reg.id,
          theoryScore: g.theory,
          physicalScore: g.physical,
          specialSkillsScore: g.special,
          subjectScores,
          finalStatus,
          updatedBy: admin.id,
        },
      });
    }
  }

  console.log(`✅ Grades: ${gradeConfigs.length} created`);

  // ─── CERTIFICATES ─────────────────────────────────────────────────────────
  const certConfigs = [
    { regIdx: 0, certNo: "CERT-2024-0001" },  // Gunawan
    { regIdx: 1, certNo: "CERT-2024-0002" },  // Budi
    { regIdx: 2, certNo: "CERT-2024-0003" },  // Dewi
  ];

  for (const c of certConfigs) {
    const reg = registrants[c.regIdx];
    if (!reg) continue;
    const existing = await prisma.certificate.findUnique({ where: { registrantId: reg.id } });
    if (!existing) {
      const token = createHash("sha256")
        .update(`${reg.id}-${c.certNo}-seed`)
        .digest("hex");
      await prisma.certificate.create({
        data: {
          registrantId: reg.id,
          certificateNumber: c.certNo,
          verificationToken: token,
          filePath: `/storage/secure_certs/cert_${token}.pdf`,
          poldaApproverId: polda.id,
        },
      });
    }
  }

  console.log(`✅ Certificates: ${certConfigs.length} created`);

  // ─── AUDIT TRAILS ─────────────────────────────────────────────────────────
  const auditData = [
    { userId: admin.id, action: "GENERATE", tableName: "certificates", afterData: { cert: "CERT-2024-0001", participant: "Gunawan Setiawan" }, ip: "192.168.1.10" },
    { userId: operator.id, action: "UPDATE", tableName: "registrants", afterData: { reg: "REG-003", status: "APPROVED" }, ip: "192.168.1.11" },
    { userId: admin.id, action: "INPUT", tableName: "grades", afterData: { batch: "ANG-003/2024", count: 4 }, ip: "192.168.1.14" },
    { userId: admin.id, action: "CREATE", tableName: "training_batches", afterData: { batch: "ANG-004/2024", type: "Satpam Industri" }, ip: "192.168.1.10" },
    { userId: operator.id, action: "CREATE", tableName: "registrants", afterData: { name: "Hana Pertiwi Lestari" }, ip: "192.168.1.11" },
    { userId: admin.id, action: "APPROVE", tableName: "grades", afterData: { batch: "ANG-002/2024", count: 32 }, ip: "192.168.1.13" },
    { userId: admin.id, action: "VERIFY_PAYMENT", tableName: "registrants", afterData: { registrant: "Ahmad Fauzi Rahmanto", paymentStatus: "PAID", paymentAmount: 2000000 }, ip: "192.168.1.10" },
    { userId: operator.id, action: "VERIFY_PAYMENT", tableName: "registrants", afterData: { registrant: "Siti Nurhaliza Putri", paymentStatus: "PAID", paymentAmount: 2000000 }, ip: "192.168.1.11" },
    { userId: admin.id, action: "VERIFY_PAYMENT", tableName: "registrants", afterData: { registrant: "Eko Prasetyo Nugroho", paymentStatus: "PARTIAL", paymentAmount: 1000000 }, ip: "192.168.1.12" },
    { userId: admin.id, action: "LOGIN", tableName: "users", afterData: { email: "admin@stms.id" }, ip: "192.168.1.10" },
    { userId: operator.id, action: "UPDATE", tableName: "registrants", afterData: { payment: "PAID", reg: "REG-006" }, ip: "192.168.1.12" },
    { userId: polda.id, action: "APPROVE", tableName: "certificates", afterData: { cert: "CERT-2024-0002", participant: "Budi Santoso" }, ip: "192.168.1.15" },
  ];

  const existingAudits = await prisma.auditTrail.count();
  if (existingAudits === 0) {
    for (const a of auditData) {
      await prisma.auditTrail.create({
        data: {
          userId: a.userId,
          action: a.action,
          tableName: a.tableName,
          afterData: a.afterData,
          ipAddress: a.ip,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 3),
        },
      });
    }
    console.log(`✅ Audit Trails: ${auditData.length} created`);
  } else {
    console.log(`⏭️  Audit Trails: skipped (already exists)`);
  }

  console.log("\n🎉 Seed selesai!");
  console.log("─────────────────────────────────────────");

  // ─── SCHEDULE ─────────────────────────────────────────────────────────────
  const schedBatch = await prisma.trainingBatch.findUnique({ where: { id: "00000000-0000-0000-0000-000000000003" } });
  const schedBatchId = schedBatch!.id;

  const scheduleData = [
    { day: "Senin", subject: "Hukum & Perundang-undangan", instructor: "Dr. Bambang Suharto", room: "Ruang A", start: "08:00", end: "10:00", type: "Teori" },
    { day: "Senin", subject: "Etika Profesi Satpam", instructor: "Drs. Wahyu Santoso", room: "Ruang A", start: "10:15", end: "12:15", type: "Teori" },
    { day: "Selasa", subject: "Teknik Pengamanan", instructor: "AKP Hendra Gunawan", room: "Ruang B", start: "08:00", end: "10:00", type: "Teori & Praktik" },
    { day: "Selasa", subject: "Bela Diri Dasar", instructor: "Kapten Rachmat Hidayat", room: "Lapangan", start: "10:15", end: "12:15", type: "Praktik" },
    { day: "Rabu", subject: "P3K", instructor: "dr. Sari Kusumawati", room: "Ruang A", start: "08:00", end: "10:00", type: "Teori & Praktik" },
    { day: "Rabu", subject: "Kebakaran & Evakuasi", instructor: "Ir. Agus Priyono", room: "Halaman", start: "10:15", end: "12:15", type: "Praktik" },
    { day: "Kamis", subject: "Hukum & Perundang-undangan", instructor: "Dr. Bambang Suharto", room: "Ruang A", start: "08:00", end: "10:00", type: "Teori" },
    { day: "Kamis", subject: "Penggunaan Alat Komunikasi", instructor: "AKP Hendra Gunawan", room: "Lab Kom", start: "10:15", end: "12:15", type: "Teori & Praktik" },
    { day: "Jumat", subject: "Bela Diri Dasar", instructor: "Kapten Rachmat Hidayat", room: "Lapangan", start: "07:30", end: "10:00", type: "Praktik" },
    { day: "Jumat", subject: "Teknik Pengamanan", instructor: "AKP Hendra Gunawan", room: "Ruang B", start: "10:15", end: "12:15", type: "Teori & Praktik" },
  ];

  let scheduleCount = 0;
  for (const s of scheduleData) {
    const existing = await prisma.schedule.findFirst({ where: { batchId: schedBatchId, day: s.day, start: s.start, subject: s.subject } });
    if (!existing) {
      await prisma.schedule.create({ data: { ...s, batchId: schedBatchId } });
      scheduleCount++;
    }
  }

  console.log(`  Schedules: ${scheduleCount} scheduled`);
  console.log("─────────────────────────────────────────");

  // ─── ATTENDANCE ────────────────────────────────────────────────────────────
  const batch3Registrants = await prisma.registrant.findMany({
    where: { batchId: schedBatchId, statusRegistration: "APPROVED" },
    include: { user: { select: { name: true } } },
  });

  const attendanceSeed = [
    { name: "Ahmad Fauzi Rahmanto", checkIn: "08:05", checkOut: "16:10", status: "LATE" },
    { name: "Siti Nurhaliza Putri", checkIn: "07:58", checkOut: "16:02", status: "PRESENT" },
    { name: "Eko Prasetyo Nugroho", checkIn: null, checkOut: null, status: "ABSENT" },
    { name: "Fitri Anggraeni Sari", checkIn: "07:50", checkOut: "16:00", status: "PRESENT" },
    { name: "Rudi Hartono Putra", checkIn: "08:15", checkOut: "16:05", status: "LATE" },
    { name: "Maya Sari Dewanti", checkIn: "07:45", checkOut: "16:00", status: "PRESENT" },
    { name: "Irwan Setiabudi", checkIn: null, checkOut: null, status: "ABSENT" },
    { name: "Lena Wulandari", checkIn: "07:52", checkOut: "16:00", status: "PRESENT" },
  ];

  let attCount = 0;
  for (const a of attendanceSeed) {
    const reg = batch3Registrants.find(r => r.user.name === a.name);
    if (!reg) continue;
    const existingAtt = await prisma.attendance.findFirst({
      where: { registrantId: reg.id, batchId: schedBatchId, date: new Date("2024-07-01") },
    });
    if (!existingAtt) {
      await prisma.attendance.create({
        data: {
          registrantId: reg.id,
          batchId: schedBatchId,
          date: new Date("2024-07-01"),
          status: a.status,
          checkIn: a.checkIn,
          checkOut: a.checkOut,
        },
      });
      attCount++;
    }
  }

  console.log(`  Attendance: ${attCount} records seeded`);
  console.log("Login credentials:");
  console.log("  admin@stms.id      / password123  (ADMIN_PUSDIKLAT)");
  console.log("  polda@stms.id      / password123  (POLDA_VERIFICATOR)");
  console.log("  operator@stms.id   / password123  (ADMIN_PUSDIKLAT)");
  console.log("  ahmad.fauzi@peserta.id / password123  (PESERTA)");
  console.log("─────────────────────────────────────────");
  console.log(`  Batches: 4 (2 COMPLETED, 1 ONGOING, 1 OPEN)`);
  console.log(`  Registrants: ${registrants.length}`);
  console.log(`  Certificates: ${certConfigs.length}`);
  console.log(`  Service Rates: ${rateData.length}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
