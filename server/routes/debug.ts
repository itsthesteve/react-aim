import { Context, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { KeyValueStore, RateLimiter } from "https://deno.land/x/oak_rate_limit@v0.1.1/mod.ts";
import { db } from "../data/index.ts";

const router = new Router({
  prefix: "/debug",
});

router.get(
  "/test",
  // @ts-ignore Deno doesn't like this due to a mismatch in Oak version
  await RateLimiter({
    store: new KeyValueStore(db),
    // store: new MapStore(),
    withUrl: true,
    windowMs: 1000, // Window for the requests that can be made in miliseconds.
    max: (ctx: Context) => 10, // Max requests within the predefined window.
    headers: true, // Default true, it will add the headers X-RateLimit-Limit, X-RateLimit-Remaining.
    message: "Too many requests, please try again later.",
    statusCode: 429,
  }),
  async ({ request, response }) => {
    response.body = "test OK\n";
  }
);

router.get(
  "/test-2",
  // @ts-ignore Deno doesn't like this due to a mismatch in Oak version
  await RateLimiter({
    store: new KeyValueStore(db),
    // store: new MapStore(),
    withUrl: true,
    windowMs: 1000, // Window for the requests that can be made in miliseconds.
    max: (ctx: Context) => 1000, // Max requests within the predefined window.
    headers: true, // Default true, it will add the headers X-RateLimit-Limit, X-RateLimit-Remaining.
    message: "Too many requests, please try again later.",
    statusCode: 429,
  }),
  async ({ request, response }) => {
    response.body = "test OK\n";
  }
);

router.post("/delete", async ({ response, request }) => {
  const entries = await Array.fromAsync(db.list({ prefix: ["ratelimit"] }));
  for await (const e of entries) {
    await db.delete(e.key);
  }

  const left = await Array.fromAsync(db.list({ prefix: ["ratelimit"] }));
  console.log("ok", left.length);
  response.body = "Deleted\n";
});

export default router.routes();
