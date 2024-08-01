import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { INITIAL_WELCOME, json } from "./data/system-messages.ts";
import msgRoutes from "./routes/msg.ts";

const router = new Router();

router
  .get("/ws", (context) => {
    const socket = context.upgrade();
    socket.addEventListener("open", () => {
      socket.send(json(INITIAL_WELCOME));
    });
  })
  .use(msgRoutes);

const app = new Application();
app.use(router.allowedMethods());
app.use(router.routes());

await app.listen({ port: 9000 });
