import Elysia from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./domains/Auth";
import { registrationRoutes } from "./domains/Registration";
import { gradingRoutes } from "./domains/Grading";
import { certRoutes, verificationRoutes, certificateListRoutes, graduationRoutes, waStatusRoutes } from "./domains/Cert_Engine";
import { poldaRoutes } from "./domains/Training";
import { batchRoutes, userRoutes, auditRoutes } from "./domains/Training/crud";
import { masterdataRoutes } from "./domains/Training/masterdata";
import { attendanceRoutes, scheduleRoutes } from "./domains/Training/attendance";

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
  .get("/", () => ({ message: "STMS API v1" }));

if (import.meta.main) {
  app.listen(3000);
  console.log(`🛡️  STMS API running at http://localhost:${app.server?.port}`);
}
