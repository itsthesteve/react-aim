import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { JsonResponseMiddleware } from "../middleware/index.ts";
import { DENO_KV_PATH } from "../data/models.ts";

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
    const db = await Deno.openKv(DENO_KV_PATH);
    const body = await request.body.json();

    const saveMsgResult = await Promise.all([
      db.set(["message", roomId, body.data.id], body.data),
      db.set(["last_message_id", roomId], body.data.id),
    ]);

    console.log({ saveMsgResult });

    response.status = 201;
    response.body = { result: "OK" };
    db.close();
  } catch (e) {
    console.warn("Error saving", e);

    response.status = 400;
    response.body = { result: ":(" };
  }
});

export default router.routes();
