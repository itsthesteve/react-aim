import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import msgRoutes from "./routes/msg.ts";
import sseRoutes from "./routes/sse.ts";
import authRoutes from "./routes/auth.ts";
import roomRoutes from "./routes/rooms.ts";

const router = new Router();

// Initial set up
// - Create the global "abc" store
try {
  const db = await Deno.openKv("./data/react-chat.sqlite");
  await db.set(["rooms", "__admin__", "abc"], {
    id: "0001",
    name: "abc",
    createdBy: "__admin__",
    createdAt: Date.now(),
  });
  db.close();
} catch (e) {
  console.warn("Error setting up", e);
}

router
  .use(authRoutes)
  .use(sseRoutes)
  .use(msgRoutes)
  .use(roomRoutes)
  .get("/test", async (context) => {
    const db = await Deno.openKv("./data/react-chat.sqlite");

    const rooms = await db.get(["rooms", "someRoomName"]);
    console.log(rooms.value);
    db.close();
  });

const app = new Application();
app.use(
  oakCors({
    credentials: true,
    origin: /http:\/\/localhost:[\d]{4}/i,
    methods: ["GET", "POST"],
  })
);
app.use(router.allowedMethods());
app.use(router.routes());

await app.listen({ port: 9000 });
