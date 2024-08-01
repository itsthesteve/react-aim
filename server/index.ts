import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { INITIAL_WELCOME, json } from "./data/system-messages.ts";
import msgRoutes from "./routes/msg.ts";
import sseRoutes from "./routes/sse.ts";

const router = new Router();

router
  .get("/ws", (context) => {
    const socket = context.upgrade();
    socket.addEventListener("open", () => {
      socket.send(json(INITIAL_WELCOME));
    });
  })
  .use(sseRoutes)
  .use(msgRoutes);

const app = new Application();
app.use(
  oakCors({
    origin: "http://localhost:8000",
  })
);
app.use(router.allowedMethods());
app.use(router.routes());

await app.listen({ port: 9000 });
