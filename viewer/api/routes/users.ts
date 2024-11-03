import { Hono } from "hono";

type FormattedUser = {
  username: Deno.KvKeyPart;
  versiontimestamp: string;
};

export default function userRoutes(db: Deno.Kv) {
  const userApp = new Hono();

  /**
   * Retrieve all users
   * @returns Array of FormattedUser objects
   */
  userApp.get("/", async (ctx) => {
    const userIter = db.list({ prefix: ["users"] });

    const users = [];
    for await (const user of userIter) {
      users.push(user);
    }

    const formatted: FormattedUser[] = users.map((user) => ({
      username: user.key[1],
      versiontimestamp: user.versionstamp,
    }));

    return ctx.json(formatted);
  });

  /**
   * Delete users in posted form data
   * Payload expected to have an array of usernames in the user[] key of the body
   * @example
   * x = new FormData()
   * x.append("users[]", "someUser")
   * x.append("users[]", "anotherUser")
   * x.getAll("users[]") // deletes ["someUser", "anotherUser"]
   */
  userApp.post("/delete", async (ctx) => {
    const fd = await ctx.req.formData();
    const users = fd.getAll("user[]") as string[];

    for (const username of users) {
      await db.delete(["users", username]);
    }

    return ctx.redirect("/users");
  });

  return userApp;
}
