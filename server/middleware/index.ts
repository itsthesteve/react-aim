import { Context, Next } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { DENO_KV_PATH } from "../data/models.ts";

// Serve response as JSON
export const JsonResponseMiddleware = async (ctx: Context, next: Next) => {
  ctx.response.headers.set("Content-Type", "application/json");
  await next();
};

// Expect a valid user
export const AuthMiddleware = async (ctx: Context, next: Next) => {
  const username = await ctx.cookies.get("__rcsession");

  if (!username) {
    ctx.response.status = 403;
    ctx.response.body = { ok: false, reason: "NOUSERCOOKIE" };
    return;
  }

  const db = await Deno.openKv(DENO_KV_PATH);

  // Make sure the user exists
  const user = await db.get(["users", username]);
  if (!user) {
    ctx.response.status = 403;
    ctx.response.body = { ok: false, reason: "NOUSER" };
    db.close();
    return;
  }

  ctx.state = { username };

  db.close();
  await next();
};
