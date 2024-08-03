import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { JsonResponseMiddleware } from "../middleware/index.ts";
import { decodeBase64 } from "jsr:@std/encoding@^0.223.0/base64";

const router = new Router();

router.use(JsonResponseMiddleware);

/**
 * Receieves a message payload from the chat window and saves to the KV
 * store with the keys "message" and the channel ID.
 */
router.post("/msg", async (context) => {
  const db = await Deno.openKv("./data/react-chat.sqlite");
  try {
    const body = await context.request.body.json();
    console.log("Saving message:", body);

    const result = await db.set(["message", "abc", body.data.id], body.data);
    await db.set(["last_message_id", "abc"], body.data.id, {
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
  db.close();
});

export default router.routes();
