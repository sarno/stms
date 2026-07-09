import { describe, test, expect, beforeAll } from "bun:test";
import { app } from "../index";
import { treaty } from "@elysiajs/eden";

let adminToken = "";
let poldaToken = "";

beforeAll(async () => {
  const loginAdmin = await app.handle(
    new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@stms.id", password: "password123" }),
    })
  );
  const adminData = await loginAdmin.json() as any;
  adminToken = adminData.token;

  const loginPolda = await app.handle(
    new Request("http://localhost/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "polda@stms.id", password: "password123" }),
    })
  );
  const poldaData = await loginPolda.json() as any;
  poldaToken = poldaData.token;
});

describe("Auth", () => {
  test("login admin berhasil", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@stms.id", password: "password123" }),
      })
    );
    const data = await res.json() as any;
    expect(res.status).toBe(200);
    expect(data.token).toBeTruthy();
    expect(data.user.role).toBe("ADMIN_PUSDIKLAT");
  });

  test("login password salah → 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@stms.id", password: "salah" }),
      })
    );
    expect(res.status).toBe(401);
  });

  test("GET /me dengan token valid", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    const data = await res.json() as any;
    expect(res.status).toBe(200);
    expect(data.email).toBe("admin@stms.id");
  });

  test("GET /me tanpa token → 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/auth/me")
    );
    expect(res.status).toBe(401);
  });
});

describe("Registration", () => {
  test("GET /batches publik bisa akses", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/registration/batches")
    );
    const data = await res.json() as any;
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /list tanpa token → 401", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/registration/list")
    );
    expect(res.status).toBe(401);
  });

  test("GET /list dengan admin token → 200", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/registration/list", {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
    );
    expect(res.status).toBe(200);
  });
});

describe("Grading", () => {
  test("PUT /grades/:id dengan polda token → 403", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/grades/fake-id", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${poldaToken}`,
        },
        body: JSON.stringify({ theory_score: 80, physical_score: 75, special_skills_score: 70 }),
      })
    );
    expect(res.status).toBe(403);
  });
});

describe("Verification", () => {
  test("GET /verify/invalidtoken → 404 dan valid: false", async () => {
    const res = await app.handle(
      new Request("http://localhost/api/v1/verify/token-tidak-ada-123")
    );
    const data = await res.json() as any;
    expect(res.status).toBe(404);
    expect(data.valid).toBe(false);
  });
});
