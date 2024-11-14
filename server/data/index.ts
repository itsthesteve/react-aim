import { load } from "jsr:@std/dotenv";
// @ts-expect-error The types aren't quite right for my fork, see link.json
import { KeyValueStore, RatelimitOptions } from "https://deno.land/x/oak_rate_limit@v0.1.1/mod.ts";

const DEV_MODE = Deno.env.get("ENV") === "dev";
const envPath = DEV_MODE ? ".env" : ".env.prod";

console.log(`Loading environment variables from ${envPath}`);

await load({
  envPath,
});

// Only use the specified local emulator when in dev mode, otherwise leave openKv to it's
// default behavior when deployed.
const DENO_KV_PATH = DEV_MODE ? Deno.env.get("DENO_KV_PATH") : undefined;

export const db = await Deno.openKv(DENO_KV_PATH);

export const RATE_LIMIT_OPTS: Partial<RatelimitOptions> = {
  store: new KeyValueStore(db),
  withUrl: true,
  message: "Slow down there cowboy...",
  statusCode: 429,
};
