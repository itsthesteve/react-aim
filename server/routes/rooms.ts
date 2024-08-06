import { Context, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import * as uuid from "jsr:@std/uuid";
import { ChatRoom } from "../../client/src/types/room.ts";
import { db } from "../data/index.ts";
import { MessageData } from "../data/models.ts";
import { AuthMiddleware, JsonResponseMiddleware } from "../middleware/index.ts";
import { STATUS_CODE } from "jsr:@oak/commons@0.11/status";
import { Status } from "https://deno.land/x/oak@v16.1.0/deps.ts";

const router = new Router();

router.use(AuthMiddleware).use(JsonResponseMiddleware);

router.get("/rooms", async ({ response, cookies }) => {
  // Middleware catches this, so we can be sure (?) the cookie exists here
  const username = (await cookies.get("__rcsession")) as string;

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

  const publicRoomRows = await Array.fromAsync(db.list<ChatRoom>({ prefix: ["rooms"] }));
  const publicRooms = publicRoomRows
    // Filter out rooms that are either global or created by the current user
    .filter((room) => !["__admin__", username].includes(room.value.createdBy))
    .filter((room) => !!room.value.public)
    .map((obj) => obj.value);

  response.body = { ok: true, userRooms, globalRooms, publicRooms };
});

/**
 * Create a new room. Requires a session cookie and a "room" property in the post body
 */
router.post("/rooms", async ({ request, response, state }) => {
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
    public: isPublic,
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

  response.body = { ok: true, roomValue };
});

router.post("/online", async ({ request, state, response }) => {
  const { room, present } = await request.body.json();

  // console.log("-- Setting", state.username, present, "in", room);
  await db.set(["online", room, state.username], {
    username: state.username,
    present,
  });

  response.body = { ok: true };
});

router.get("/online", async (ctx) => {
  const room = ctx.request.url.searchParams.get("room");
  if (!room) {
    ctx.response.status = 400;
    ctx.response.body = { ok: false, reason: "NOROOM" };
    return;
  }

  const target = await ctx.sendEvents();
  const stream = db.watch([["online", room]]);

  for await (const [entry] of stream) {
    const result = [];
    const onlineList = await Array.fromAsync(db.list({ prefix: ["online", room] }));
    for (const user of onlineList) {
      result.push(user.value);
    }

    const present = result.filter((r) => r.present === true);
    console.log("Presence", present);
    target.dispatchMessage(present);
  }
});

export default router.routes();
