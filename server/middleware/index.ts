import { Context, Next } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { db } from "../data/index.ts";

// Serve response as JSON
export const JsonResponseMiddleware = async (ctx: Context, next: Next) => {
  ctx.response.headers.set("Content-Type", "application/json");
  await next();
};

// Expect a valid user
export const AuthMiddleware = async (ctx: Context, next: Next) => {
  const username = await ctx.cookies.get("__rcsession");
  const currentRoom = await ctx.cookies.get("__rcpresence");

  if (!username) {
    ctx.response.status = 403;
    ctx.response.body = { ok: false, reason: "NOUSERCOOKIE" };
    return;
  }

  if (!currentRoom) {
    ctx.response.status = 403;
    ctx.response.body = { ok: false, reason: "NOPRESENCE" };
    return;
  }

  // Make sure the user exists
  const user = await db.get(["users", username]);
  if (!user) {
    ctx.response.status = 403;
    ctx.response.body = { ok: false, reason: "NOUSER" };
    return;
  }

  ctx.state = { username, currentRoom };

  await next();
};
