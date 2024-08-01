import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import msgRoutes from "./routes/msg.ts";
import sseRoutes from "./routes/sse.ts";

const router = new Router();

router.use(sseRoutes).use(msgRoutes);

const app = new Application();
app.use(
  oakCors({
    origin: /http:\/\/localhost:[\d]{4}/i,
  })
);
app.use(router.allowedMethods());
app.use(router.routes());

await app.listen({ port: 9000 });
