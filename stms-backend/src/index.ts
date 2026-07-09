import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { join } from "path";
import { authRoutes } from "./domains/Auth";
import { registrationRoutes } from "./domains/Registration";
import { gradingRoutes } from "./domains/Grading";
import { certRoutes, verificationRoutes, certificateListRoutes, graduationRoutes, waStatusRoutes } from "./domains/Cert_Engine";
import { poldaRoutes } from "./domains/Training";
import { batchRoutes, userRoutes, auditRoutes } from "./domains/Training/crud";
import { masterdataRoutes } from "./domains/Training/masterdata";
import { attendanceRoutes, scheduleRoutes } from "./domains/Training/attendance";
import { dashboardRoutes } from "./domains/Training/dashboard";

export const app = new Elysia()
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET || "stms-jwt-secret-dev-2026" }))
  .use(cors())
  .use(authRoutes)
  .use(registrationRoutes)
  .use(gradingRoutes)
  .use(certRoutes)
  .use(certificateListRoutes)
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
  .get("/storage/uploads/*", async ({ params, set }) => {
    const filePath = join(process.cwd(), "storage", "uploads", params["*"]);
    const file = Bun.file(filePath);
    if (!(await file.exists())) { set.status = 404; return { error: "File tidak ditemukan" }; }
    return new Response(file, { headers: { "Content-Type": file.type || "application/octet-stream" } });
  })
  .get("/", () => ({ message: "STMS API v1" }));

if (import.meta.main) {
  app.listen(3000);
  console.log(`🛡️  STMS API running at http://localhost:${app.server?.port}`);
}
