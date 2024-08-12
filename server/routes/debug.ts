import { Context, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { RateLimiter } from "https://deno.land/x/oak_rate_limit@v0.1.1/mod.ts";

const router = new Router({
  prefix: "/debug",
});

// Deno doesn't like this, some version mismatch or something, but it
// works as of this writing.
router.use(
  await RateLimiter({
    windowMs: 1000, // Window for the requests that can be made in miliseconds.
    max: (ctx: Context) => 10, // Max requests within the predefined window.
    headers: true, // Default true, it will add the headers X-RateLimit-Limit, X-RateLimit-Remaining.
    message: "Too many requests, please try again later.",
    statusCode: 429,
  })
);

router.get("/test", async ({ request, response }) => {
  response.body = "test OK\n";
});

export default router.routes();
