import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { ChatRoom } from "../client/src/types/room.ts";
import { db } from "./data/index.ts";
import { DEFAULT_ROOM } from "./data/models.ts";
import authRoutes from "./routes/auth.ts";
import chatRoutes from "./routes/chat.ts";
import debugRoutes from "./routes/debug.ts";
import roomRoutes from "./routes/rooms.ts";

const router = new Router();

// Initial set up
// - Create the global default store. Based on the value of DEFAULT_ROOM
try {
  await db.set(["rooms", "__admin__", DEFAULT_ROOM], {
    id: "0001",
    name: DEFAULT_ROOM,
    createdBy: "__admin__",
    isPublic: true,
    createdAt: Date.now(),
  } as ChatRoom);
} catch (e) {
  console.warn("Error setting up", e);
}

router.use(debugRoutes).use(authRoutes).use(chatRoutes).use(roomRoutes);

const app = new Application();
app.use(
  oakCors({
    credentials: true,
    origin: /http:\/\/localhost:[\d]{4}/i,
  })
);

app.use(router.allowedMethods());
app.use(router.routes());

await app.listen({ port: 9000 });
export default app;

console.log("Server shutdown");
