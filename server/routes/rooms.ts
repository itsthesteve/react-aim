import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import * as uuid from "jsr:@std/uuid";
import { AuthMiddleware, JsonResponseMiddleware } from "../middleware/index.ts";

const router = new Router();

router.use(AuthMiddleware).use(JsonResponseMiddleware);

router.get("/rooms", async ({ response, cookies }) => {
  // Middleware catches this, so we can be sure (?) the cookie exists here
  const username = (await cookies.get("__rcsession")) as string;

  const db = await Deno.openKv("./data/react-chat.sqlite");
  const userRoomRows = db.list({ prefix: ["rooms", username] });
  const globalRoomsRows = db.list({ prefix: ["rooms", "__admin__"] });

  const userRooms = [];
  for await (const room of userRoomRows) {
    userRooms.push(room.value);
  }

  const globalRooms = [];
  for await (const room of globalRoomsRows) {
    globalRooms.push(room.value);
  }

  response.body = { ok: true, userRooms, globalRooms };
});

/**
 * Create a new room. Requires a session cookie and a "room" property in the post body
 */
router.post("/rooms", async ({ request, response, cookies }) => {
  // Middleware catches this, so we can be sure (?) the cookie exists here
  const username = (await cookies.get("__rcsession")) as string;

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

  console.log("User", username, "wants to create room", roomName);

  // Check to see if the room exists
  const { value: existingRoom } = await db.get(["rooms", username, roomName]);
  if (existingRoom) {
    response.status = 400;
    response.body = { ok: false };
    db.close();
    return;
  }

  // User checks pass, create the room
  const roomValue = {
    id: uuid.v1.generate(),
    name: roomName,
    createdBy: username,
    createdAt: Date.now(),
  };

  await db.set(["rooms", username, roomName], roomValue);
  console.log(username, "created room:", roomName);

  response.body = { ok: true, roomValue };

  db.close();
});

/**
 * Simple setter to see who is in a certain room
 */
router.post("/presence", async (ctx) => {
  const { username, room, present } = await ctx.request.body.json();
  let ok = false;
  try {
    const db = await Deno.openKv("./data/react-chat.sqlite");
    await db.set(["room_presence", room, username], present);
    db.close();
    ok = true;
  } catch (e) {
    console.warn("Error saving presence: ", e);
  } finally {
    ctx.response.body = { ok };
  }
});

router.get("/presence", async (ctx) => {
  const roomName = ctx.request.url.searchParams.get("room");
  if (!roomName) {
    ctx.response.status = 400;
    ctx.response.body = { ok: false, reason: "NOROOMNAME" };
    return;
  }

  const target = await ctx.sendEvents();
  const db = await Deno.openKv("./data/react-chat.sqlite");

  for await (const [ping] of db.watch([["room_presence", roomName]])) {
    console.log("Ping", ping);
  }
});

export default router.routes();
