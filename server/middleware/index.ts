import { Context, Next } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import {
  RateLimiter,
  Ratelimiter,
  RatelimitOptions,
} from "https://deno.land/x/oak_rate_limit@v0.1.1/mod.ts";

import { db, RATE_LIMIT_OPTS } from "../data/index.ts";
import { AUTH_COOKIE_NAME } from "../cookies.ts";
import { AUTH_PRESENCE_COOKIE } from "../cookies.ts";

// Serve response as JSON
export const JsonResponseMiddleware = async (ctx: Context, next: Next) => {
  ctx.response.headers.set("Content-Type", "application/json");
  await next();
};

// Expect a valid user
export const AuthMiddleware = async (ctx: Context, next: Next) => {
  const username = await ctx.cookies.get(AUTH_COOKIE_NAME);
  const currentRoom = await ctx.cookies.get(AUTH_PRESENCE_COOKIE);

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

export const RateLimitMiddleware = async (
  opts: Pick<RatelimitOptions, "windowMs" | "max"> = {
    windowMs: 60 * 1000 * 60, // one hour
    max: () => Promise.resolve(2),
  }
): Promise<Ratelimiter> => {
  // @ts-ignore Deno doesn't like this due to a mismatch in Oak version
  // Limit account creation to 2 every hour
  return await RateLimiter({
    ...RATE_LIMIT_OPTS,
    ...opts,
  });
};
