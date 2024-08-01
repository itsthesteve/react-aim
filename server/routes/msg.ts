import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";

const router = new Router();

router.use((ctx, next) => {
  ctx.response.headers.set("Content-Type", "application/json");
  next();
});

router.post("/msg", async (context) => {
  context.response.body = { result: "OK" };
});

export default router.routes();
