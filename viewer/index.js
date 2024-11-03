import "jsr:@std/dotenv/load";
import { openKv } from "@deno/kv";

const kv = await openKv("http://localhost:4512");

const userIter = kv.list({ prefix: ["users"] });

for await (const user of userIter) {
  console.log(user);
}
