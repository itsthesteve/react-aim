import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { db } from "../data/index.ts";
import { RateLimitMiddleware } from "../middleware/index.ts";

const router = new Router({
  prefix: "/debug",
});

router.get(
  "/test",
  // @ts-ignore Deno doesn't like this due to a mismatch in Oak version
  await RateLimitMiddleware({
    windowMs: 10000,
    max: () => 100,
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
