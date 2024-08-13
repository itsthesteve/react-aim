import "jsr:@std/dotenv/load";
import { KeyValueStore, RatelimitOptions } from "https://deno.land/x/oak_rate_limit@v0.1.1/mod.ts";

const DENO_KV_PATH = Deno.env.get("DENO_KV_PATH") ?? "./server/data/react-chat.sqlite";
export const db = await Deno.openKv(DENO_KV_PATH);

export const RATE_LIMIT_OPTS: Partial<RatelimitOptions> = {
  store: new KeyValueStore(db),
  withUrl: true,
  headers: true, // Default true, it will add the headers X-RateLimit-Limit, X-RateLimit-Remaining.
  message: "Slow down there cowboy...",
  statusCode: 429,
};
