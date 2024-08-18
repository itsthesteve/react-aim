import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { db } from "../data/index.ts";

const router = new Router({
  prefix: "/debug",
});

router.get("/test", async ({ response }) => {
  const list = db.list({ prefix: ["presence"] });
  for await (const entry of list) {
    console.log(entry);
  }

  response.status = 200;
});

router.delete("/test", async ({ response }) => {
  const list = db.list({ prefix: ["presence"] });
  for await (const entry of list) {
    console.log("Deleted", entry);
    await db.delete(entry.key);
  }

  response.status = 200;
});

export default router.routes();
