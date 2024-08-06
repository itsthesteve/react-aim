import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { JsonResponseMiddleware } from "../middleware/index.ts";
import { db } from "../data/index.ts";

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

  try {
    const body = await request.body.json();

    const msgSaveRes = await db.set(["message", roomId, body.data.id], body.data);
    const lastMsgRes = await db.atomic().set(["last_message_id", roomId], body.data.id).commit();
    console.log({ msgSaveRes, lastMsgRes });

    response.status = 201;
    response.body = { result: "OK" };
  } catch (e) {
    console.warn("Error saving", e);

    response.status = 400;
    response.body = { result: ":(" };
  }
});

export default router.routes();
