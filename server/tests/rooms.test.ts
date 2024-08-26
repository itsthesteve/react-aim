import "jsr:@std/dotenv/load";
import { superoak } from "https://deno.land/x/superoak@4.8.1/mod.ts";
import app from "../index.ts";

Deno.test("it will allow you to make multiple assertions on one SuperOak instance", async () => {
  const request = await superoak(app);

  await request
    .get("/rooms")
    .set("Cookie", "__rcsession=test;__rcpresence=abc")
    .withCredentials()
    .expect(200)
    .expect("Content-Type", /json/);
  // .catch(() => {});
});
