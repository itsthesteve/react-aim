import { Context, NativeRequest, Next } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { RateLimiter, RatelimitOptions } from "https://deno.land/x/oak_rate_limit@v0.1.1/mod.ts";

import { AUTH_COOKIE_NAME, AUTH_PRESENCE_COOKIE, COOKIE_OPTIONS } from "../cookies.ts";
import { db, RATE_LIMIT_OPTS } from "../data/index.ts";
import { canAccess } from "../utils/room.ts";

// Serve response as JSON
export const JsonResponseMiddleware = async (ctx: Context, next: Next) => {
  ctx.response.headers.set("Content-Type", "application/json");
  await next();
};

// Expect a valid user
export const AuthMiddleware = async (ctx: Context, next: Next) => {
  const { response, state, cookies } = ctx;

  const username = await cookies.get(AUTH_COOKIE_NAME);
  const currentRoom = await cookies.get(AUTH_PRESENCE_COOKIE);

  if (!username) {
    response.status = 403;
    response.body = { ok: false, reason: "NOUSERCOOKIE" };
    return;
  }

  if (!currentRoom) {
    response.status = 403;
    response.body = { ok: false, reason: "NOPRESENCE" };
    return;
  }

  // Make sure the user exists
  const user = await db.get(["users", username]);
  if (!user) {
    response.status = 403;
    response.body = { ok: false, reason: "NOUSER" };
    return;
  }

  state.username = username;

  await next();
};

export const RateLimitMiddleware = async (
  opts: Pick<RatelimitOptions, "windowMs" | "max"> = {
    windowMs: 60 * 1000 * 60, // one hour
    max: () => Promise.resolve(2),
  }
): Promise<typeof RateLimiter> => {
  // @ts-ignore Deno doesn't like this due to a mismatch in Oak version
  // Limit account creation to 2 every hour
  return await RateLimiter({
    ...RATE_LIMIT_OPTS,
    ...opts,
  });
};

export const BouncerMiddleware = async (ctx: Context, next: Next) => {
  const { request, state, response, cookies } = ctx;

  let requestedRoom: string | null = null;

  if (request.method === "POST") {
    // Lotta hoop jumping to clone a request body
    const cloned = (ctx.request.originalRequest as NativeRequest).request.clone();
    const body = await cloned.json();
    requestedRoom = body.room;
  } else {
    requestedRoom = request.url.searchParams.get("room");
  }

  if (!requestedRoom) {
    response.status = 400;
    response.body = { ok: false, reason: "NOROOM" };
    return;
  }

  const currentRoom = await cookies.get(AUTH_PRESENCE_COOKIE);
  const authorized = await canAccess(requestedRoom, state.username);

  if (!authorized) {
    console.warn("Unauthorized attempt", request.url.pathname, {
      requested: requestedRoom,
      current: currentRoom,
    });
    response.status = 401;
    response.body = { ok: false, reason: "NOTALLOWED" };
    return;
  }

  await cookies.set(AUTH_PRESENCE_COOKIE, requestedRoom, COOKIE_OPTIONS);
  state.currentRoom = requestedRoom;

  return await next();
};
