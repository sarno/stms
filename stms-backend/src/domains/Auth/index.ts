import Elysia from "elysia";
import bcrypt from "bcryptjs";
import prisma from "../../shared/db";

export const authRoutes = new Elysia({ prefix: "/api/v1/auth" })
  .post("/login", async ({ body, jwt, set }) => {
    const { email, password } = body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      set.status = 401;
      return { error: "Email atau password salah" };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      set.status = 401;
      return { error: "Email atau password salah" };
    }

    const token = await jwt.sign({
      sub: user.id,
      role: user.role,
      name: user.name,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  })
  .get("/me", async ({ jwt, set, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Token tidak ditemukan" };
    }

    const token = authHeader.slice(7);
    const payload = await jwt.verify(token);
    if (!payload) {
      set.status = 401;
      return { error: "Token tidak valid" };
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, name: true, email: true, role: true, phoneNumber: true },
    });

    if (!user) {
      set.status = 404;
      return { error: "User tidak ditemukan" };
    }

    return user;
  });
