import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { db } from "../data/index.ts";
import { RateLimitMiddleware } from "../middleware/index.ts";

const router = new Router({
  prefix: "/debug",
});

router.post("/test", async ({ request, response }) => {
  const body = await request.body.json();

  console.log(body);
  response.status = 200;
});

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
