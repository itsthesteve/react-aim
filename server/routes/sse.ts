import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { MessageData } from "../data/models.ts";
import { INITIAL_WELCOME } from "../data/system-messages.ts";
import { AuthMiddleware } from "../middleware/index.ts";

const router = new Router();

router.use(AuthMiddleware);

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

router.get("/events", async (ctx) => {
  const roomId = ctx.request.url.searchParams.get("room");
  if (!roomId) {
    ctx.response.status = 400;
    ctx.response.body = { ok: false, reason: "NOROOMID" };
    return;
  }

  const target = await ctx.sendEvents();
  target.dispatchMessage(INITIAL_WELCOME);

  const db = await Deno.openKv("./data/react-chat.sqlite");
  const username = (await ctx.cookies.get("__rcsession")) as string;

  // Store the last seen message and make sure it sticks
  const seen = await db.get<string>(["last_seen", username, roomId], { consistency: "strong" });

  for await (const [lastEntry] of db.watch([["last_message_id", roomId]])) {
    const lastId = lastEntry.value as string;
    if (!lastId) {
      return;
    }

    const newMessages = await Array.fromAsync(
      db.list({
        start: ["message", roomId, seen.value || "", ""],
        end: ["message", roomId, lastId, ""],
      })
    );

    // Update the last seen to get only fresh messages
    await db.set(["last_seen", username, roomId], lastId);

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
