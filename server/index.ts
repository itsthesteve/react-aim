import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import authRoutes from "./routes/auth.ts";
import msgRoutes from "./routes/msg.ts";
import roomRoutes from "./routes/rooms.ts";
import sseRoutes from "./routes/sse.ts";
import { DEFAULT_ROOM, DENO_KV_PATH } from "./data/models.ts";

const router = new Router();

// Initial set up
// - Create the global default store. Based on the value of DEFAULT_ROOM
try {
  const db = await Deno.openKv(DENO_KV_PATH);
  await db.set(["rooms", "__admin__", DEFAULT_ROOM], {
    id: "0001",
    name: DEFAULT_ROOM,
    createdBy: "__admin__",
    public: true,
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
  .get("/test", async () => {});

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
