import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { ulid } from "jsr:@std/ulid";
import { db } from "../data/index.ts";
import { Message, MessageData } from "../data/models.ts";
import {
  AuthMiddleware,
  BouncerMiddleware,
  JsonResponseMiddleware,
  RateLimitMiddleware,
} from "../middleware/index.ts";

const router = new Router({
  prefix: "/chat",
});

router.use(AuthMiddleware).use(BouncerMiddleware);

/**
 * Get's all the messages for the channel based on the roomId search param at once.
 */
router.get("/", JsonResponseMiddleware, async ({ response, state }) => {
  const entries = db.list({ prefix: ["message", state.currentRoom] });
  const result = [];
  for await (const entry of entries) {
    result.push(entry.value);
  }

  response.body = result;
});

/**
 * Server Sent Events endpoint ƒor getting messages
 */
router.get("/messages", async (ctx) => {
  const roomName = ctx.state.currentRoom;
  const target = await ctx.sendEvents();

  // Provided by AuthProvider
  const { username } = ctx.state;

  const stream = db.watch([["last_message_id", roomName]]);
  for await (const [lastEntry] of stream) {
    const lastId = lastEntry.value as string;
    if (!lastId) {
      // This only seems to happen on a fresh room creation. No idea why.
      console.warn("Warn: No last_message value");
    } else {
      // Get the last seen message
      const seen = await db.get<string>(["last_seen", username, roomName]);
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
            room: m.key[1] as string,
            data: m.value as MessageData,
          };
        })
        .forEach((payload) => target.dispatchMessage(payload));
    }
  }

  console.log("!! SSE Closed");
});

/**
 * Receieves a message payload from the chat window and saves to the KV
 * store with the keys "message" and the channel ID.
 */
router.post(
  "/message",
  await RateLimitMiddleware({
    windowMs: 1000,
    max: () => 3,
  }),
  async ({ request, response, state }) => {
    const roomName = state.currentRoom;
    try {
      const body: Message = await request.body.json();
      const msgId = ulid();

      await db.set(["message", roomName, msgId], { ...body.data, id: msgId });
      await db.set(["last_message_id", roomName], msgId);

      response.status = 201;
      response.body = { result: "OK" };
    } catch (e) {
      console.warn("Error saving", e);

      response.status = 400;
      response.body = { result: ":(" };
    }
  }
);

export default router.routes();
