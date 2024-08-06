import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { MessageData } from "../data/models.ts";
import { AuthMiddleware } from "../middleware/index.ts";
import { db } from "../data/index.ts";

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

  const entries = db.list({ prefix: ["message", roomId] });
  const result = [];
  for await (const entry of entries) {
    result.push(entry.value);
  }

  response.body = result;
});

/**
 * Server Sent Events endpoint ƒor getting messages
 */
router.get("/events", async (ctx) => {
  const roomName = ctx.request.url.searchParams.get("room");
  if (!roomName) {
    ctx.response.status = 400;
    ctx.response.body = { ok: false, reason: "NOROOMID" };
    return;
  }

  const target = await ctx.sendEvents();

  // Provided by AuthProvider
  const { username } = ctx.state;

  const stream = db.watch([["last_message_id", roomName]]);
  for await (const [lastEntry] of stream) {
    const lastId = lastEntry.value as string;
    if (!lastId) {
      // This only seems to happen on a fresh room creation. No idea why.
      console.warn("Warn: No last_message value");
      target.dispatchComment("No messages yet");
      return;
    }

    // Get the last seen message
    const seen = await db.get<string>(["last_seen", username, roomName]);
    console.log(seen);
    const newMessages = await Array.fromAsync(
      db.list({
        start: ["message", roomName, seen.value || "", ""],
        end: ["message", roomName, lastId, ""],
      })
    );

    // Update the last seen to get only fresh messages
    await db.set(["last_seen", username, roomName], lastId);

    newMessages
      .map((m) => {
        return {
          channel: m.key[1] as string,
          data: m.value as MessageData,
        };
      })
      .forEach((payload) => target.dispatchMessage(payload));
  }
  // We never get here for... reasons?
  console.log("!! SSE Closed");
});

export default router.routes();
