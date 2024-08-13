import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { ChatRoom } from "../client/src/types/room.ts";
import { db } from "./data/index.ts";
import { DEFAULT_ROOM } from "./data/models.ts";
import authRoutes from "./routes/auth.ts";
import debugRoutes from "./routes/debug.ts";
import roomRoutes from "./routes/rooms.ts";
import chatRoutes from "./routes/chat.ts";

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

router
  // TODO: Add granular rate limiting?
  // Deno doesn't like this, some version mismatch or something, but it
  // works as of this writing.
  // .use(
  //   /**
  //    * There's some conflict with versions in the lang server or something.
  //    * This works as of this writing, but Deno's not happy.
  //    * Same thing with the error on max(). It's defined as a function in the linked
  //    * version, but going to source shows the old one.
  //    */

  //   /* @ts-ignore */
  //   await RateLimiter({
  //     windowMs: ONE_MINUTE, // Window for the requests that can be made in miliseconds.
  //     max: () => 100, // Max requests within the predefined window.
  //     headers: false,
  //     message: "Slow down there cowboy...",
  //     statusCode: 429,
  //   })
  // )
  .use(debugRoutes)
  .use(authRoutes)
  .use(chatRoutes)
  .use(roomRoutes);

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

console.log("Server shutdown");
