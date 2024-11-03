import { Hono } from "hono";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import rateLimitRoutes from "./routes/ratelimit.ts";
import userRoutes from "./routes/users.ts";
import messagesRoutes from "./routes/messages.ts";

config({ export: true });

const app = new Hono().basePath("/api");
const db = await Deno.openKv(Deno.env.get("DENO_KV_PATH"));

app.route("/users", userRoutes(db));
app.route("/ratelimit", rateLimitRoutes(db));
app.route("/messages", messagesRoutes(db));

Deno.serve(app.fetch);
