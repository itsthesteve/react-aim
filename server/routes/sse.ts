import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { MessageData } from "../data/models.ts";
import { INITIAL_WELCOME } from "../data/system-messages.ts";

const router = new Router();

/**
 * Get's all the messages for the channel based on the roomId search param at once.
 */
router.get("/channel", async ({ request, response }) => {
  // Ensure there's a room parameter
  const roomId = request.url.searchParams.get("room");
  if (!roomId) {
    response.status = 400;
    response.body = { ok: false, reason: "NOROOMID" };
    return;
  }

  const db = await Deno.openKv("./data/react-chat.sqlite");
  const entries = db.list({ prefix: ["message", roomId] });
  const result = [];
  for await (const entry of entries) {
    result.push(entry.value);
  }

  response.body = result;
  db.close();
});

// TODO: Move this to the store or something, it's wonky moving between rooms
let seen = "";
router.get("/events", async (ctx) => {
  const roomId = ctx.request.url.searchParams.get("room");
  if (!roomId) {
    ctx.response.status = 400;
    ctx.response.body = { ok: false, reason: "NOROOMID" };
    return;
  }

  const db = await Deno.openKv("./data/react-chat.sqlite");
  const target = await ctx.sendEvents();
  target.dispatchMessage(INITIAL_WELCOME);

  for await (const [lastEntry] of db.watch([["last_message_id", roomId]])) {
    const lastId = lastEntry.value as string;
    if (!lastId) {
      return;
    }

    const newMessages = await Array.fromAsync(
      db.list({
        start: ["message", roomId, seen, ""],
        end: ["message", roomId, lastId, ""],
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

  db.close();
});

export default router.routes();
