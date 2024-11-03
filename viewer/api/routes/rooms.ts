import { Hono } from "hono";

type RoomListShape = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
};

export default function roomRoutes(db: Deno.Kv) {
  const roomApp = new Hono();

  roomApp.get("/", async (ctx) => {
    const result = [];
    const list = db.list<RoomListShape>({ prefix: ["rooms"] });
    for await (const entry of list) {
      result.push(entry);
    }

    const fmt = Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const formatted = result.map((entry) => {
      const [, creator, name] = entry.key;
      const { id, isPublic, createdAt: created } = entry.value;
      console.log(entry.value);

      return {
        id,
        creator,
        name,
        isPublic,
        created: fmt.format(new Date(created)),
      };
    });

    return ctx.json(formatted);
  });

  roomApp.get("/msgCount", async (ctx) => {
    const room = ctx.req.query("room");
    if (!room) {
      return ctx.json({ reason: "No room provided" }, 400);
    }

    const count = db.list({ prefix: ["message", room] });
    let total = 0;
    for await (const _ of count) {
      total++;
    }

    return ctx.json({ room, total });
  });

  return roomApp;
}
