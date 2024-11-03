import { Hono } from "hono";

// Query type for getting rate limit values
export type RateLimitValue = { remaining: number; lastRequestTimestamp: number };

export default function rateLimitRoutes(db: Deno.Kv) {
  const limitApp = new Hono();

  /**
   * Retrieve all rate limit entries
   * @return
   */
  limitApp.get("/", async (ctx) => {
    const ip = ctx.req.query("ip");

    const searchKey = ["ratelimit"];

    if (ip) {
      searchKey.push(ip);
    }

    const list = db.list<RateLimitValue>({ prefix: searchKey });
    const entries = [];
    for await (const entry of list) {
      entries.push(entry);
    }

    const formatted = entries.map((entry: Deno.KvEntry<RateLimitValue>) => {
      const [, url, ip] = entry.key;
      const { remaining, lastRequestTimestamp } = entry.value;
      return {
        ip,
        url,
        remaining,
        lastRequestTimestamp,
      };
    });

    return ctx.json(formatted);
  });

  return limitApp;
}
