import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { db } from "./data/index.ts";
import { DEFAULT_ROOM } from "./data/models.ts";
import { staticHandler } from "./middleware/index.ts";
import authRoutes from "./routes/auth.ts";
import chatRoutes from "./routes/chat.ts";
import debugRoutes from "./routes/debug.ts";
import roomRoutes from "./routes/rooms.ts";
import { type ChatRoom } from "./types.ts";

const router = new Router({ prefix: "/api" });

// Initial setup
// - Create the global default store
// TODO: Send this to our API to make sure it's done correctly
// instead of doing it manually here.
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
const corsOpts =
  Deno.env.get("ENV") === "dev"
    ? {
        credentials: true,
        origin: /http:\/\/localhost:[\d]{4}/i,
      }
    : undefined;

if (corsOpts !== undefined) {
  console.warn("Using CORS credentials");
}

app.use(oakCors(corsOpts));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(staticHandler());

console.log("Listening on port 8000");
await app.listen({ port: 8000 });

console.log("Server shutdown");
