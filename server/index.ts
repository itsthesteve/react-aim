import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import msgRoutes from "./routes/msg.ts";
import sseRoutes from "./routes/sse.ts";
import authRoutes from "./routes/auth.ts";
import roomRoutes from "./routes/rooms.ts";

const router = new Router();

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
