import { Context, Next } from "https://deno.land/x/oak@v16.1.0/mod.ts";

export const JsonResponseMiddleware = async (ctx: Context, next: Next) => {
  ctx.response.headers.set("Content-Type", "application/json");
  await next();
};
