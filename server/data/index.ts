import "jsr:@std/dotenv/load";

const DENO_KV_PATH = Deno.env.get("DENO_KV_PATH") ?? "./data/react-chat.sqlite";
export const db = await Deno.openKv(DENO_KV_PATH);
