import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { join, resolve } from "path";
import { authRoutes } from "./domains/Auth";
import { registrationRoutes } from "./domains/Registration";
import { gradingRoutes } from "./domains/Grading";
import { certRoutes, verificationRoutes, graduationRoutes, waStatusRoutes } from "./domains/Cert_Engine";
import { poldaRoutes } from "./domains/Training";
import { batchRoutes, userRoutes, auditRoutes } from "./domains/Training/crud";
import { masterdataRoutes } from "./domains/Training/masterdata";
import { attendanceRoutes, scheduleRoutes } from "./domains/Training/attendance";
import { dashboardRoutes } from "./domains/Training/dashboard";
import { financeRoutes } from "./domains/Finance";
import { reportsRoutes } from "./domains/Reports";
import { roleRoutes } from "./domains/Roles";
import { publicRoutes } from "./domains/Public";
import { waService } from "./shared/whatsapp";

const FRONTEND_DIST = resolve(import.meta.dir, "..", "..", "stms-frontend", "dist");

const app = new Elysia()
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET || "stms-jwt-secret-dev-2026" }))
  .use(cors())
  .use(authRoutes)
  .use(registrationRoutes)
  .use(gradingRoutes)
  .use(certRoutes)
  .use(verificationRoutes)
  .use(graduationRoutes)
  .use(waStatusRoutes)
  .use(poldaRoutes)
  .use(batchRoutes)
  .use(userRoutes)
  .use(auditRoutes)
  .use(masterdataRoutes)
  .use(attendanceRoutes)
  .use(scheduleRoutes)
  .use(dashboardRoutes)
  .use(financeRoutes)
  .use(reportsRoutes)
  .use(roleRoutes)
  .use(publicRoutes)
  .get("/storage/uploads/*", async ({ params, set }) => {
    const filePath = join(process.cwd(), "storage", "uploads", params["*"]);
    const file = Bun.file(filePath);
    if (!(await file.exists())) { set.status = 404; return { error: "File tidak ditemukan" }; }
    return new Response(file, { headers: { "Content-Type": file.type || "application/octet-stream" } });
  })
  .get("/storage/secure_certs/*", async ({ params, set }) => {
    const filePath = join(process.cwd(), "storage", "secure_certs", params["*"]);
    const file = Bun.file(filePath);
    if (!(await file.exists())) { set.status = 404; return { error: "File tidak ditemukan" }; }
    return new Response(file, { headers: { "Content-Type": file.type || "application/octet-stream" } });
  });

if (process.env.NODE_ENV === "production") {
  const distExists = await Bun.file(join(FRONTEND_DIST, "index.html")).exists();
  if (distExists) {
    app.get("/*", async ({ request }) => {
      const url = new URL(request.url);
      let filePath = join(FRONTEND_DIST, url.pathname === "/" ? "index.html" : url.pathname.slice(1));
      let file = Bun.file(filePath);
      if (await file.exists()) return new Response(file);
      filePath = join(FRONTEND_DIST, "index.html");
      file = Bun.file(filePath);
      if (await file.exists()) return new Response(file, { headers: { "Content-Type": "text/html" } });
      return new Response("Not Found", { status: 404 });
    });
    console.log("📦 Serving frontend from:", FRONTEND_DIST);
  }
}

if (import.meta.main) {
  app.listen(3000);
  console.log(`🛡️  STMS API running at http://localhost:${app.server?.port}`);
  waService.connect().catch((err) => {
    console.error("Gagal menghubungkan WhatsApp:", err);
  });
}
