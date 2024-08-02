import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import msgRoutes from "./routes/msg.ts";
import sseRoutes from "./routes/sse.ts";

const router = new Router();

router
  .use(sseRoutes)
  .use(msgRoutes)
  .get("/test", async (context) => {
    const db = await Deno.openKv("./data/react-chat.sqlite");

    const single = await db.get(["message", "abc", "msg-1722623151908"]);
    console.log({ single });

    const entries = db.list({ prefix: ["message", "abc"] });
    for await (const entry of entries) {
      console.log(entry);
    }

    const newMessages = await Array.fromAsync(
      db.list({
        start: ["message", "abc", "msg-1722628167891"],
        end: ["message", "abc", "msg-1722628284691"],
      })
    );

    console.log({ newMessages });
    context.response.body = newMessages;
  });

const app = new Application();
app.use(
  oakCors({
    origin: /http:\/\/localhost:[\d]{4}/i,
  })
);
app.use(router.allowedMethods());
app.use(router.routes());

await app.listen({ port: 9000 });
