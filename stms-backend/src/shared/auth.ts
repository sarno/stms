import type { Context } from "elysia";
import { jwt as elysiaJwt } from "@elysiajs/jwt";
import prisma from "./db";

export async function requireAuth(ctx: any) {
  const authHeader = ctx.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    ctx.set.status = 401;
    return { error: "Token tidak ditemukan" };
  }

  const token = authHeader.slice(7);
  const payload = await ctx.jwt.verify(token);
  if (!payload) {
    ctx.set.status = 401;
    return { error: "Token tidak valid" };
  }

  ctx.userId = payload.sub as string;
  ctx.userRole = payload.role as string;
}
