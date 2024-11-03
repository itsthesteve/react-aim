import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

type KvMessageShape = {
  id: string;
  owner: string;
  payload: string;
};

type KvRoomShape = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
};

type FormattedMessage = {
  id: string;
  owner: string;
  text: string;
};

export default function messagesRoutes(db: Deno.Kv) {
  const msgApp = new Hono();

  /**
   * Retrieve all messages for a given room
   * Requires a "room" query param
   * @return List of FormattedMessage objects
   * @example /api/messages?room=abc
   */
  msgApp.get("/", async (ctx) => {
    const room = ctx.req.query("room");
    if (!room) {
      return ctx.json({ reason: "No room provided" }, 400);
    }

    // Check to see if the room exists, return 404 if not.
    // TODO (#35) Make a directory-style KV table to make searching more efficient
    const roomList = db.list<KvRoomShape>({ prefix: ["rooms"] });
    let roomExists = false;
    for await (const r of roomList) {
      const name = r.key[2];
      if (name === room) {
        roomExists = true;
        break;
      }
    }

    if (!roomExists) {
      return ctx.json({ reason: `Room "${room}" not found.` }, 404);
    }

    const entries = db.list<KvMessageShape>({ prefix: ["message", room] });
    const result = [];
    for await (const entry of entries) {
      result.push(entry);
    }

    const formatted: FormattedMessage[] = result.map((entry) => {
      const [, room, id] = entry.key;
      const { owner, payload: text } = entry.value;

      return {
        id: id as string,
        room: room as string,
        owner,
        text,
      };
    });

    return ctx.json(formatted);
  });

  return msgApp;
}
