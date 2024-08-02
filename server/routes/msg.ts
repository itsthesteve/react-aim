import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";

const router = new Router();
const kv = await Deno.openKv("./data/react-chat.sqlite");

router.use(async (ctx, next) => {
  ctx.response.headers.set("Content-Type", "application/json");
  await next();
});

/**
 * Receieves a message payload from the chat window and saves to the KV
 * store with the keys "message" and the channel ID.
 */
router.post("/msg", async (context) => {
  try {
    const body = await context.request.body.json();
    console.log("Saving message:", body);

    const result = await kv.set(["message", "abc", body.data.id], body.data);
    await kv.set(["last_message_id", "abc"], body.data.id, {
      expireIn: 3_600_000, // one hour
    });

    console.log("Result saving:", result);

    context.response.status = 201;
    context.response.body = { result: "OK" };
  } catch (e) {
    console.warn("Error saving", e);

    context.response.status = 400;
    context.response.body = { result: ":(" };
  }
});

export default router.routes();
