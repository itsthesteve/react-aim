import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { INITIAL_WELCOME } from "../data/system-messages.ts";

const router = new Router();
const db = await Deno.openKv("./data/react-chat.sqlite");

/**
 * Get's all the messages for the channel "abc" at once.
 * No need for SSE here
 */
router.get("/channel", async (ctx) => {
  const entries = db.list({ prefix: ["message", "abc"] });
  const result = [];
  for await (const entry of entries) {
    result.push(entry.value);
  }

  ctx.response.body = result;
});

router.get("/events", async (ctx) => {
  const target = await ctx.sendEvents();
  target.dispatchMessage(INITIAL_WELCOME);

  // YAH: Figure out how to set and retrieve messages instead
  // of overwriting them
  const stream = db.watch([["abc", "????"], []]);
  for await (const entry of stream) {
    console.log("Dispatching", entry);
    target.dispatchMessage(entry);
  }
});

export default router.routes();
