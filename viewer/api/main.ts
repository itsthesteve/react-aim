import { Hono } from "hono";
import { cors } from "hono/cors";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import rateLimitRoutes from "./routes/ratelimit.ts";
import userRoutes from "./routes/users.ts";
import messagesRoutes from "./routes/messages.ts";
import roomRoutes from "./routes/rooms.ts";

config({ export: true });

const app = new Hono().basePath("/api");
const db = await Deno.openKv(Deno.env.get("DENO_KV_PATH"));

app.use(cors());
app.route("/users", userRoutes(db));
app.route("/ratelimit", rateLimitRoutes(db));
app.route("/messages", messagesRoutes(db));
app.route("/rooms", roomRoutes(db));

Deno.serve(app.fetch);
