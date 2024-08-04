import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { JsonResponseMiddleware } from "../middleware/index.ts";

const router = new Router();

router.use(JsonResponseMiddleware);

/**
 * Receieves a message payload from the chat window and saves to the KV
 * store with the keys "message" and the channel ID.
 */
router.post("/msg", async ({ request, response }) => {
  const roomId = request.url.searchParams.get("room");
  if (!roomId) {
    response.status = 400;
    response.body = { ok: false, reason: "NOROOMID" };
    return;
  }

  const db = await Deno.openKv("./data/react-chat.sqlite");
  try {
    const body = await request.body.json();
    console.log("Saving message:", body);

    const result = await db.set(["message", roomId, body.data.id], body.data);
    await db.set(["last_message_id", roomId], body.data.id, {
      expireIn: 3_600_000, // one hour
    });

    console.log("Result saving:", result);

    response.status = 201;
    response.body = { result: "OK" };
  } catch (e) {
    console.warn("Error saving", e);

    response.status = 400;
    response.body = { result: ":(" };
  }

  db.close();
});

export default router.routes();
