import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { MessageData } from "../data/models.ts";
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

let seen = "";
router.get("/events", async (ctx) => {
  const target = await ctx.sendEvents();
  target.dispatchMessage(INITIAL_WELCOME);

  for await (const [lastEntry] of db.watch([["last_message_id", "abc"]])) {
    const lastId = lastEntry.value as string;
    if (!lastId) {
      return;
    }
    const newMessages = await Array.fromAsync(
      db.list({
        start: ["message", "abc", seen, ""],
        end: ["message", "abc", lastId, ""],
      })
    );
    seen = lastId;

    newMessages
      .map((m) => {
        return {
          channel: m.key[1] as string,
          data: m.value as MessageData,
        };
      })
      .forEach((payload) => target.dispatchMessage(payload));
  }
});

export default router.routes();
