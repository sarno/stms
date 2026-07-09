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
    create: { id: "00000000-0000-0000-0000-000000000001", batchName: "Gada Pratama Angkatan 001/2024", startDate: new Date("2024-01-08"), endDate: new Date("2024-02-16"), quota: 40, status: "COMPLETED" },
  });
  const batch2 = await prisma.trainingBatch.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000002", batchName: "Gada Pratama Angkatan 002/2024", startDate: new Date("2024-03-04"), endDate: new Date("2024-04-12"), quota: 40, status: "COMPLETED" },
  });
  const batch3 = await prisma.trainingBatch.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000003", batchName: "Gada Madya Angkatan 003/2024", startDate: new Date("2024-06-03"), endDate: new Date("2024-07-12"), quota: 30, status: "ONGOING" },
  });
  const batch4 = await prisma.trainingBatch.upsert({
    where: { id: "00000000-0000-0000-0000-000000000004" },
    update: {},
    create: { id: "00000000-0000-0000-0000-000000000004", batchName: "Gada Utama Angkatan 004/2024", startDate: new Date("2024-09-02"), endDate: new Date("2024-10-11"), quota: 35, status: "OPEN" },
  });

  console.log("✅ Training Batches: 4 created");

  // ─── REGISTRANTS ──────────────────────────────────────────────────────────
  const registrantConfigs = [
    // ANG-001 (COMPLETED) — peserta 6,7 (graduated)
    { userIdx: 6, batch: batch1, ktp: "3274011507860007", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", docs: { ktp: "/storage/uploads/ktp_007.jpg", skck: "/storage/uploads/skck_007.pdf", foto: "/storage/uploads/foto_007.jpg" } },
    // ANG-002 (COMPLETED) — peserta 2,3 (graduated)
    { userIdx: 2, batch: batch2, ktp: "3274011203880003", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", docs: { ktp: "/storage/uploads/ktp_003.jpg", skck: "/storage/uploads/skck_003.pdf", foto: "/storage/uploads/foto_003.jpg" } },
    { userIdx: 3, batch: batch2, ktp: "3274014509910004", edu: "D3", status: "APPROVED", payment: "PAID", docs: { ktp: "/storage/uploads/ktp_004.jpg", skck: "/storage/uploads/skck_004.pdf", foto: "/storage/uploads/foto_004.jpg" } },
    // ANG-003 (ONGOING) — peserta 0,1,4,5,8,9,10,11
    { userIdx: 0, batch: batch3, ktp: "3274011504890002", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", docs: { ktp: "/storage/uploads/ktp_001.jpg", skck: "/storage/uploads/skck_001.pdf", foto: "/storage/uploads/foto_001.jpg" } },
    { userIdx: 1, batch: batch3, ktp: "3274016708920001", edu: "S1", status: "APPROVED", payment: "PAID", docs: { ktp: "/storage/uploads/ktp_002.jpg", foto: "/storage/uploads/foto_002.jpg" } },
    { userIdx: 4, batch: batch3, ktp: "3274011012870005", edu: "SMA/SMK", status: "APPROVED", payment: "PARTIAL", docs: { ktp: "/storage/uploads/ktp_005.jpg", skck: "/storage/uploads/skck_005.pdf" } },
    { userIdx: 5, batch: batch3, ktp: "3274012801930006", edu: "D3", status: "APPROVED", payment: "PAID", docs: { ktp: "/storage/uploads/ktp_006.jpg", skck: "/storage/uploads/skck_006.pdf", foto: "/storage/uploads/foto_006.jpg" } },
    { userIdx: 8, batch: batch3, ktp: "3274011908950009", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", docs: { ktp: "/storage/uploads/ktp_009.jpg", skck: "/storage/uploads/skck_009.pdf", foto: "/storage/uploads/foto_009.jpg" } },
    { userIdx: 9, batch: batch3, ktp: "3274015503920010", edu: "SMA/SMK", status: "APPROVED", payment: "PAID", docs: { ktp: "/storage/uploads/ktp_010.jpg", skck: "/storage/uploads/skck_010.pdf", foto: "/storage/uploads/foto_010.jpg" } },
    { userIdx: 10, batch: batch3, ktp: "3274011207890011", edu: "SMA/SMK", status: "APPROVED", payment: "PARTIAL", docs: { ktp: "/storage/uploads/ktp_011.jpg" } },
    { userIdx: 11, batch: batch3, ktp: "3274012904940012", edu: "D3", status: "APPROVED", payment: "PAID", docs: { ktp: "/storage/uploads/ktp_012.jpg", skck: "/storage/uploads/skck_012.pdf", foto: "/storage/uploads/foto_012.jpg" } },
    // ANG-004 (OPEN) — peserta 7
    { userIdx: 7, batch: batch4, ktp: "3274012203950008", edu: "SMA/SMK", status: "PENDING_VERIFICATION", payment: "UNPAID", docs: { ktp: "/storage/uploads/ktp_008.jpg" } },
  ];

  const registrants: any[] = [];
  for (const cfg of registrantConfigs) {
    const existing = await prisma.registrant.findFirst({
      where: { userId: pesertaUsers[cfg.userIdx].id, batchId: cfg.batch.id },
    });
    if (!existing) {
      const r = await prisma.registrant.create({
        data: {
          userId: pesertaUsers[cfg.userIdx].id,
          batchId: cfg.batch.id,
          ktpNumber: cfg.ktp,
          educationLevel: cfg.edu,
          documentUrls: cfg.docs,
          statusRegistration: cfg.status,
          paymentStatus: cfg.payment,
        },
      });
      registrants.push(r);
    } else {
      registrants.push(existing);
    }
  }

  console.log(`✅ Registrants: ${registrants.length} created`);

  // ─── GRADES ───────────────────────────────────────────────────────────────
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
    const existing = await prisma.grade.findUnique({ where: { registrantId: reg.id } });
    if (!existing) {
      await prisma.grade.create({
        data: {
          registrantId: reg.id,
          theoryScore: g.theory,
          physicalScore: g.physical,
          specialSkillsScore: g.special,
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
  console.log("Login credentials:");
  console.log("  admin@stms.id      / password123  (ADMIN_PUSDIKLAT)");
  console.log("  polda@stms.id      / password123  (POLDA_VERIFICATOR)");
  console.log("  operator@stms.id   / password123  (ADMIN_PUSDIKLAT)");
  console.log("  ahmad.fauzi@peserta.id / password123  (PESERTA)");
  console.log("─────────────────────────────────────────");
  console.log(`  Batches: 4 (2 COMPLETED, 1 ONGOING, 1 OPEN)`);
  console.log(`  Registrants: ${registrants.length}`);
  console.log(`  Certificates: ${certConfigs.length}`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
