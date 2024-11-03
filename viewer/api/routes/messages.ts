import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

type KvMessageShape = {
  id: string;
  owner: string;
  payload: string;
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
      throw new HTTPException(400, { message: "No room provided" });
    }

    const roomList = db.list({ prefix: ["rooms"] });
    for await (const room of roomList) {
      console.log(room);
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
