import Elysia from "elysia";

const masterData = {
  trainingCenters: [
    { id: "1", name: "LP3SD Jakarta Pusat", address: "Jl. Kebon Sirih No. 72, Jakarta Pusat", licenseNo: "KEP-001/SATPAM/2018", capacity: 120, activeBatches: 1, status: "active" },
    { id: "2", name: "LP3SD Jakarta Selatan", address: "Jl. Fatmawati No. 18, Jakarta Selatan", licenseNo: "KEP-002/SATPAM/2019", capacity: 80, activeBatches: 0, status: "active" },
    { id: "3", name: "LP3SD Bogor", address: "Jl. Juanda No. 45, Kota Bogor", licenseNo: "KEP-003/SATPAM/2020", capacity: 60, activeBatches: 0, status: "inactive" },
  ],
  instructors: [
    { id: "1", name: "Kombes Pol. Dr. Bambang Suharto", nip: "INS-001", specialization: "Hukum Kepolisian", subjects: ["Hukum & Perundang-undangan", "Etika Profesi"], status: "active", phone: "0811-234-5678" },
    { id: "2", name: "AKP Drs. Hendra Gunawan", nip: "INS-002", specialization: "Teknik Pengamanan", subjects: ["Teknik Pengamanan", "Bela Diri Dasar"], status: "active", phone: "0812-345-6789" },
    { id: "3", name: "Kapten TNI Rachmat Hidayat", nip: "INS-003", specialization: "Bela Diri & Taktik", subjects: ["Bela Diri Dasar"], status: "active", phone: "0813-456-7890" },
    { id: "4", name: "dr. Sari Kusumawati, M.Kes", nip: "INS-004", specialization: "Kesehatan & P3K", subjects: ["P3K"], status: "active", phone: "0814-567-8901" },
    { id: "5", name: "Ir. Agus Priyono, M.T.", nip: "INS-005", specialization: "Fire Safety", subjects: ["Kebakaran & Evakuasi"], status: "active", phone: "0815-678-9012" },
    { id: "6", name: "Drs. Wahyu Santoso", nip: "INS-006", specialization: "Manajemen Keamanan", subjects: ["Etika Profesi"], status: "inactive", phone: "0816-789-0123" },
  ],
  curricula: [
    { id: "1", code: "KUR-001", name: "Satpam Umum (Gada Pratama)", trainingType: "Satpam Umum", totalHours: 232, subjectsCount: 8, status: "active", effectiveDate: "2023-01-01" },
    { id: "2", code: "KUR-002", name: "Satpam Madya (Gada Madya)", trainingType: "Satpam VIP", totalHours: 280, subjectsCount: 10, status: "active", effectiveDate: "2023-01-01" },
    { id: "3", code: "KUR-003", name: "Satpam Utama (Gada Utama)", trainingType: "Satpam Industri", totalHours: 320, subjectsCount: 12, status: "draft", effectiveDate: "2024-08-01" },
  ],
  subjects: [
    { id: "1", code: "MPL-001", name: "Hukum & Perundang-undangan", curriculum: "KUR-001", theoryHours: 24, practiceHours: 8, totalHours: 32, kkm: 70, type: "Teori" },
    { id: "2", code: "MPL-002", name: "Etika Profesi Satpam", curriculum: "KUR-001", theoryHours: 16, practiceHours: 8, totalHours: 24, kkm: 70, type: "Teori & Praktik" },
    { id: "3", code: "MPL-003", name: "Teknik Pengamanan", curriculum: "KUR-001", theoryHours: 20, practiceHours: 20, totalHours: 40, kkm: 70, type: "Teori & Praktik" },
    { id: "4", code: "MPL-004", name: "Bela Diri Dasar", curriculum: "KUR-001", theoryHours: 8, practiceHours: 32, totalHours: 40, kkm: 70, type: "Praktik" },
    { id: "5", code: "MPL-005", name: "P3K (Pertolongan Pertama)", curriculum: "KUR-001", theoryHours: 12, practiceHours: 12, totalHours: 24, kkm: 70, type: "Teori & Praktik" },
    { id: "6", code: "MPL-006", name: "Kebakaran & Evakuasi", curriculum: "KUR-001", theoryHours: 8, practiceHours: 16, totalHours: 24, kkm: 70, type: "Praktik" },
    { id: "7", code: "MPL-007", name: "Penggunaan Alat Komunikasi", curriculum: "KUR-001", theoryHours: 12, practiceHours: 12, totalHours: 24, kkm: 70, type: "Teori & Praktik" },
    { id: "8", code: "MPL-008", name: "Laporan dan Administrasi", curriculum: "KUR-001", theoryHours: 16, practiceHours: 8, totalHours: 24, kkm: 70, type: "Teori" },
  ],
  certTemplates: [
    {
      id: "1",
      code: "TPL-001",
      name: "Template Ijazah Gada Pratama",
      trainingType: "Satpam Umum",
      orientation: "landscape",
      pageSize: "A4",
      primaryColor: "#1a3a5c",
      accentColor: "#c9a84c",
      fontFamily: "Times New Roman",
      hasQR: true,
      hasDigitalSign: true,
      status: "active",
      createdAt: "2023-01-15",
      updatedAt: "2024-05-20",
    },
    {
      id: "2",
      code: "TPL-002",
      name: "Template Ijazah Gada Madya",
      trainingType: "Satpam VIP",
      orientation: "landscape",
      pageSize: "A4",
      primaryColor: "#0f2942",
      accentColor: "#d4af37",
      fontFamily: "Times New Roman",
      hasQR: true,
      hasDigitalSign: true,
      status: "active",
      createdAt: "2023-02-10",
      updatedAt: "2024-03-12",
    },
    {
      id: "3",
      code: "TPL-003",
      name: "Template Ijazah Gada Utama",
      trainingType: "Satpam Industri",
      orientation: "landscape",
      pageSize: "A4",
      primaryColor: "#1e293b",
      accentColor: "#0ea5e9",
      fontFamily: "Times New Roman",
      hasQR: true,
      hasDigitalSign: true,
      status: "active",
      createdAt: "2023-06-01",
      updatedAt: "2024-06-18",
    },
    {
      id: "4",
      code: "TPL-004",
      name: "Template Sertifikat Kompetensi",
      trainingType: "Umum",
      orientation: "portrait",
      pageSize: "A4",
      primaryColor: "#059669",
      accentColor: "#fbbf24",
      fontFamily: "Arial",
      hasQR: true,
      hasDigitalSign: false,
      status: "active",
      createdAt: "2023-08-20",
      updatedAt: "2024-01-10",
    },
    {
      id: "5",
      code: "TPL-005",
      name: "Template Sertifikat Penghargaan",
      trainingType: "Umum",
      orientation: "landscape",
      pageSize: "A4",
      primaryColor: "#7c2d12",
      accentColor: "#fbbf24",
      fontFamily: "Georgia",
      hasQR: false,
      hasDigitalSign: false,
      status: "draft",
      createdAt: "2024-02-14",
      updatedAt: "2024-02-14",
    },
    {
      id: "6",
      code: "TPL-006",
      name: "Template Ijazah Lama (Deprecated)",
      trainingType: "Satpam Umum",
      orientation: "portrait",
      pageSize: "Legal",
      primaryColor: "#000000",
      accentColor: "#666666",
      fontFamily: "Courier New",
      hasQR: false,
      hasDigitalSign: false,
      status: "inactive",
      createdAt: "2020-01-01",
      updatedAt: "2022-12-31",
    },
  ],
}

function authGuard(headers: any, jwt: any, role?: string) {
  const authHeader = headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) return { error: "Token tidak ditemukan", status: 401 };
  return null;
}

export const masterdataRoutes = new Elysia({ prefix: "/api/v1/masterdata" })
  // Training Centers
  .get("/training-centers", async () => masterData.trainingCenters)
  .post("/training-centers", async ({ body, set }) => {
    const item = { ...(body as any), id: crypto.randomUUID() };
    masterData.trainingCenters.push(item);
    set.status = 201;
    return item;
  })
  .put("/training-centers/:id", async ({ params, body }) => {
    const idx = masterData.trainingCenters.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.trainingCenters[idx] = { ...(body as any), id: params.id };
    return masterData.trainingCenters[idx];
  })
  .delete("/training-centers/:id", async ({ params }) => {
    const idx = masterData.trainingCenters.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.trainingCenters.splice(idx, 1);
    return { message: "Berhasil dihapus" };
  })
  // Instructors
  .get("/instructors", async () => masterData.instructors)
  .post("/instructors", async ({ body, set }) => {
    const item = { ...(body as any), id: crypto.randomUUID() };
    masterData.instructors.push(item);
    set.status = 201;
    return item;
  })
  .put("/instructors/:id", async ({ params, body }) => {
    const idx = masterData.instructors.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.instructors[idx] = { ...(body as any), id: params.id };
    return masterData.instructors[idx];
  })
  .delete("/instructors/:id", async ({ params }) => {
    const idx = masterData.instructors.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.instructors.splice(idx, 1);
    return { message: "Berhasil dihapus" };
  })
  // Curricula
  .get("/curricula", async () => masterData.curricula)
  .post("/curricula", async ({ body, set }) => {
    const item = { ...(body as any), id: crypto.randomUUID() };
    masterData.curricula.push(item);
    set.status = 201;
    return item;
  })
  .put("/curricula/:id", async ({ params, body }) => {
    const idx = masterData.curricula.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.curricula[idx] = { ...(body as any), id: params.id };
    return masterData.curricula[idx];
  })
  .delete("/curricula/:id", async ({ params }) => {
    const idx = masterData.curricula.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.curricula.splice(idx, 1);
    return { message: "Berhasil dihapus" };
  })
  // Subjects
  .get("/subjects", async () => masterData.subjects)
  .post("/subjects", async ({ body, set }) => {
    const item = { ...(body as any), id: crypto.randomUUID() };
    masterData.subjects.push(item);
    set.status = 201;
    return item;
  })
  .put("/subjects/:id", async ({ params, body }) => {
    const idx = masterData.subjects.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.subjects[idx] = { ...(body as any), id: params.id };
    return masterData.subjects[idx];
  })
  .delete("/subjects/:id", async ({ params }) => {
    const idx = masterData.subjects.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.subjects.splice(idx, 1);
    return { message: "Berhasil dihapus" };
  })
  // Cert Templates
  .get("/cert-templates", async () => masterData.certTemplates)
  .post("/cert-templates", async ({ body, set }) => {
    const item = { ...(body as any), id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) };
    masterData.certTemplates.push(item);
    set.status = 201;
    return item;
  })
  .put("/cert-templates/:id", async ({ params, body }) => {
    const idx = masterData.certTemplates.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.certTemplates[idx] = { ...(body as any), id: params.id, updatedAt: new Date().toISOString().slice(0, 10) };
    return masterData.certTemplates[idx];
  })
  .delete("/cert-templates/:id", async ({ params }) => {
    const idx = masterData.certTemplates.findIndex(i => i.id === params.id);
    if (idx >= 0) masterData.certTemplates.splice(idx, 1);
    return { message: "Berhasil dihapus" };
  });
