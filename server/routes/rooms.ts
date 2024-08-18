import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import * as uuid from "jsr:@std/uuid";
import { ChatRoom } from "../../client/src/types/room.ts";
import { AUTH_PRESENCE_COOKIE } from "../cookies.ts";
import { db } from "../data/index.ts";
import { MessageData, User } from "../data/models.ts";
import { AuthMiddleware, BouncerMiddleware, JsonResponseMiddleware } from "../middleware/index.ts";

const router = new Router({
  prefix: "/rooms",
});

router.use(AuthMiddleware).use(JsonResponseMiddleware);

/**
 * Retrieve all rooms that the user has access to
 */
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
  const open = publicRoomRows
    // Filter out rooms that are either global or created by the current user
    .filter((room) => !["__admin__", state.username].includes(room.value.createdBy))
    .filter((room) => !!room.value.isPublic)
    .map((obj) => obj.value);

  response.body = { ok: true, user: userRooms, global: globalRooms, open };
});

/**
 * Create a new room
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

type BeaconEvents = "visibilitychange" | "unload" | "load" | "logout";
type PresenceType = "active" | "idle" | "absent" | "unknown"; // unknown shouldn't happen
interface PresenceBody {
  event: BeaconEvents;
  user: User;
  room: string;
  present: boolean;
}
/**
 * Update the users presence in the given room. Event types can be one of
 * "visibilitychange" | "unload" | "load" | "logout" as defined as above, shared with the type
 * defined in the useBeacon hook
 * TODO: Might want to move to redis as this is a pretty heavy hit URL
 */
router.post("/presence", async ({ request, response }) => {
  const { event, user, room, present } = (await request.body.json()) as PresenceBody;
  let state: PresenceType;

  switch (event) {
    case "load":
      // user is present, not idle
      state = "active";
      break;
    case "visibilitychange":
      // user is either present or idle
      state = present ? "active" : "idle";
      break;
    case "logout":
    case "unload":
      // user is offline
      // user is not on the app
      state = "absent";
      break;
    default:
      console.log("Unknown state");
      state = "unknown";
  }

  await db.set(
    ["presence_update"],
    {
      user,
      state,
    },
    {
      // There's a cron job that cleans these up every 3 days
      expireIn: 1000 * 60 * 60 * 24 * 3, // 3 days
    }
  );

  await db.set(["presence", room, user.username], {
    user,
    state,
  });

  console.log("user presence updated", user.username, room, present);

  response.status = 200;
});

/**
 * Server sent events for listening to user presence values
 */
router.get("/presence", BouncerMiddleware, async (ctx) => {
  const target = await ctx.sendEvents();

  const { state } = ctx;
  const room = state.currentRoom;

  for await (const _ of db.watch([["presence_update"]])) {
    const allUsers = await Array.fromAsync(db.list({ prefix: ["presence", room] }));
    const presentUsers = allUsers.filter((u) => u.value?.state !== "absent").map((e) => e.value);
    target.dispatchMessage({ ok: true, results: presentUsers });
  }
});

export default router.routes();
