import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { AuthMiddleware, JsonResponseMiddleware } from "../middleware/index.ts";
import { db } from "../data/index.ts";
import { Message } from "../data/models.ts";

const router = new Router();

router.use(AuthMiddleware).use(JsonResponseMiddleware);

/**
 * Receieves a message payload from the chat window and saves to the KV
 * store with the keys "message" and the channel ID.
 */
router.post("/msg", async ({ request, response, cookies }) => {
  const requestRoom = request.url.searchParams.get("room");
  const roomName = await cookies.get("__rcpresence");
  if (!roomName) {
    response.status = 400;
    response.body = { ok: false, reason: "NOPRESENCE" };
    return;
  }

  if (requestRoom !== roomName) {
    response.status = 401;
    response.body = { ok: false, reason: "CONFLICTINGPRESENCE" };
    return;
  }

  console.log("Passed:", requestRoom, roomName);

  try {
    const body: Message = await request.body.json();

    await db.set(["message", roomName, body.data.id], body.data);
    await db.set(["last_message_id", roomName], body.data.id);

    response.status = 201;
    response.body = { result: "OK" };
  } catch (e) {
    console.warn("Error saving", e);

    response.status = 400;
    response.body = { result: ":(" };
  }
});

export default router.routes();
