import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import * as uuid from "jsr:@std/uuid";

const router = new Router();

/**
 * Create a new room. Requires a session cookie and a "room" property in the post body
 */
router.post("/rooms", async ({ request, response, cookies }) => {
  // Make sure the cookie exists
  const username = await cookies.get("__rcsession");
  if (!username) {
    response.status = 403;
    response.body = { ok: false, reason: "NOUSER" };
    return;
  }

  const { room: roomName } = await request.body.json();

  // Needs a "room" property in the request body
  if (!roomName) {
    response.status = 400;
    response.body = { ok: false, reason: "No room specified" };
    return;
  }

  // Only alphanumeric room names
  if (/^[a-z0-9]+$/i.test(roomName) === false) {
    response.status = 400;
    response.body = { ok: false, reason: "Room names must be alphanumeric" };
    return;
  }

  const db = await Deno.openKv("./data/react-chat.sqlite");

  // Make sure the user exists
  const user = await db.get(["users", username]);
  if (!user) {
    response.status = 403;
    response.body = { ok: false, reason: "NOUSER" };
    db.close();
    return;
  }

  console.log("User", username, "wants to create room", roomName);

  // Check to see if the room exists
  const { value: existingRoom } = await db.get(["rooms", roomName]);
  if (existingRoom) {
    response.status = 400;
    response.body = { ok: false };
    db.close();
    return;
  }

  // User checks pass, create the room
  const result = await db.set(["rooms", roomName], {
    id: uuid.v1.generate(),
    name: roomName,
    createdBy: username,
    createdAt: Date.now(),
  });

  console.log(username, "created", roomName);

  response.body = { ok: true, result };

  db.close();
});

export default router.routes();
