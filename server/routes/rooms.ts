import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { ulid } from "jsr:@std/ulid/ulid";
import * as uuid from "jsr:@std/uuid";
import { AUTH_PRESENCE_COOKIE } from "../cookies.ts";
import { db } from "../data/index.ts";
import { MessageData, User } from "../data/models.ts";
import { AuthMiddleware, BouncerMiddleware, JsonResponseMiddleware } from "../middleware/index.ts";
import { type ChatRoom } from "../types.ts";

const ROOM_NAME_REGEX = /^[a-z0-9-_+!~+|/\\]*$/i;

// Validation constants
const ROOM_NAME_MIN = 3;
const ROOM_NAME_MAX = 24;

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
  // Validate body before doing anything else
  const CreateRoomSchema = z.object({
    room: z.string().trim().min(ROOM_NAME_MIN).max(ROOM_NAME_MAX).regex(ROOM_NAME_REGEX),
    isPublic: z.boolean(),
  });

  const body = await request.body.json();

  const validRoomPost = CreateRoomSchema.safeParse(body);
  if (validRoomPost.error) {
    console.warn("Invalid room name");
    response.status = 400;
    response.body = { ok: false };
    return;
  }

  const { username } = state;
  const { room, isPublic } = body;

  console.log("User", username, "wants to create room", room);

  // Validation checks pass, create the room
  const roomValue = {
    id: uuid.v1.generate(),
    name: room,
    createdBy: username,
    createdAt: Date.now(),
    isPublic,
  };

  const msgId = ulid();
  // Check to see if the room exists, create it, and an initial message
  const initialMessageOp = await db
    .atomic()
    .check({ key: ["rooms", username, room], versionstamp: null })
    .check({ key: ["room_names", room], versionstamp: null })
    .set(["rooms", username, room], roomValue)
    .set(["room_names", room], { creator: username, isPublic })
    .set(["message", room, msgId], {
      id: msgId,
      owner: "__system__",
      payload: "Welcome to " + room,
    } as MessageData)
    .commit();

  // This shouldn't happen, but check for it anyway
  if (!initialMessageOp.ok) {
    console.warn("Error creating room", initialMessageOp);
    response.status = 500;
    response.body = { ok: false, reason: "Error creating room" };
    return;
  }

  console.log(username, "created room:", room);

  await cookies.set(AUTH_PRESENCE_COOKIE, room, {
    path: "/",
    secure: false,
    httpOnly: true,
    maxAge: 31536000,
  });

  response.status = 201;
  response.body = { ok: true, roomValue };
});

type BeaconEvents = "visibilitychange" | "pagehide" | "unload" | "load" | "logout";
type PresenceType = "active" | "idle" | "absent" | "unknown"; // unknown shouldn't happen
interface PresenceBody {
  event: BeaconEvents;
  user: User;
  room: string;
  present: boolean;
}
/**
 * Update the users presence in the given room. Event types can be one of
 * type BeaconEvents defined as above, shared with the type
 * defined in the usePresence hook
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
      // app is open, but is either focused or not
      state = present ? "active" : "idle";
      break;
    case "logout":
    case "pagehide":
      // user has logged out, or app is not focused
      state = "absent";
      break;
    default:
      console.log("Unknown state", event);
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

  console.log("user presence updated", event, user.username, room, present);

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
