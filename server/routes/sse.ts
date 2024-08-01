import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";

const router = new Router();

const kv = await Deno.openKv("./data/react-chat.sqlite");

router.get("/events", async (ctx) => {
  const target = await ctx.sendEvents();

  const stream = kv.watch([["message"]]);
  for await (const entries of stream) {
    console.log("Found", entries);
    entries[0].key; // ["foo"]
    entries[0].value; // "bar"
    entries[0].versionstamp; // "00000000000000010000"

    target.dispatchMessage({ msg: entries[0] });
  }
});

export default router.routes();
