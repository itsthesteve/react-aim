import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";

const router = new Router();
const kv = await Deno.openKv("./data/react-chat.sqlite");

router.use((ctx, next) => {
  ctx.response.headers.set("Content-Type", "application/json");
  next();
});

router.post("/msg", async (context) => {
  context.response.body = { result: "OK" };
  // YAH: Add the message to the store here,
  // remove websocket from the client
});

export default router.routes();
