import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import * as uuid from "jsr:@std/uuid";
import { ChatRoom } from "../../client/src/types/room.ts";
import { db } from "../data/index.ts";
import { MessageData } from "../data/models.ts";
import { AuthMiddleware, JsonResponseMiddleware } from "../middleware/index.ts";
import { canAccess } from "../utils/room.ts";
import { AUTH_COOKIE_NAME, AUTH_PRESENCE_COOKIE } from "../cookies.ts";

const router = new Router({
  prefix: "/rooms",
});

router.use(AuthMiddleware).use(JsonResponseMiddleware);

/**
 * Set the online flag for the given room
 */
router.get("/access", async ({ request, response, cookies, state }) => {
  const room = request.url.searchParams.get("room");

  // Dunno what you're looking for...
  if (!room) {
    response.body = { ok: false, reason: "NOROOM" };
    response.status = 400;
    return;
  }

  const exists = await canAccess(room, state.username);
  if (!exists) {
    console.warn(`Room ${room} doesn't exist or is not public.`);
    response.status = 404;
    response.body = { ok: false, reason: "NOROOM" };
    return;
  }

  // ...otherwise, everything's good. Set the cookie and allow passage.
  await cookies.set(AUTH_PRESENCE_COOKIE, room, {
    path: "/",
    secure: false,
    httpOnly: true,
    maxAge: 31536000,
  });

  response.status = 200;
  response.body = { ok: true };
});

router.get("/", async ({ response, state }) => {
  const userRoomRows = db.list({ prefix: ["rooms", state.username] });
  const globalRoomsRows = db.list({ prefix: ["rooms", "__admin__"] });

  const userRooms = [];
  for await (const room of userRoomRows) {
    userRooms.push(room.value);
  }

  const globalRooms = [];
  for await (const room of globalRoomsRows) {
    globalRooms.push(room.value);
  }

  const publicRoomRows = await Array.fromAsync(db.list<ChatRoom>({ prefix: ["rooms"] }));
  const publicRooms = publicRoomRows
    // Filter out rooms that are either global or created by the current user
    .filter((room) => !["__admin__", state.username].includes(room.value.createdBy))
    .filter((room) => !!room.value.isPublic)
    .map((obj) => obj.value);

  response.body = { ok: true, userRooms, globalRooms, publicRooms };
});

/**
 * Create a new room. Requires a session cookie and a "room" property in the post body
 */
router.post("/", async ({ request, response, cookies, state }) => {
  // Middleware catches this, so we can be sure (?) the cookie exists here
  const { username } = state;

  const { room: roomName, isPublic } = await request.body.json();

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

  const KV_ROOM_KEY = ["rooms", username, roomName];

  console.log("User", username, "wants to create room", roomName);

  // Check to see if the room exists
  const { value: existingRoom } = await db.get(KV_ROOM_KEY);
  if (existingRoom) {
    response.status = 400;
    response.body = { ok: false };
    return;
  }

  // User checks pass, create the room
  const roomValue = {
    id: uuid.v1.generate(),
    name: roomName,
    createdBy: username,
    createdAt: Date.now(),
    isPublic,
  };

  const msgId = uuid.v1.generate();
  await db
    .atomic()
    .set(KV_ROOM_KEY, roomValue)
    .set(["message", roomName, msgId], {
      id: msgId,
      owner: "__system__",
      payload: "Welcome to " + roomName,
    } as MessageData)
    .commit();

  console.log(username, "created room:", roomName);

  await cookies.set(AUTH_PRESENCE_COOKIE, roomName, {
    path: "/",
    secure: false,
    httpOnly: true,
    maxAge: 31536000,
  });

  response.body = { ok: true, roomValue };
});

router.get("/online", async (ctx) => {
  const target = await ctx.sendEvents();
  target.dispatchMessage({ connected: true });
});

export default router.routes();
