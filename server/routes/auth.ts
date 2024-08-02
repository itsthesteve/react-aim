import { deleteCookie, setCookie } from "https://deno.land/std/http/cookie.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { AuthCredentials, UserRow } from "../data/models.ts";

const router = new Router({
  prefix: "/auth",
});

const AUTH_COOKIE_NAME = "__rcsession";

/**
 * Login
 * Requires username, password and password verfication in
 * the request body
 */
router.post("/login", async (context) => {
  const { username, password } = await context.request.body.json();

  const db = await Deno.openKv("./data/react-chat.sqlite");
  const existingUser = await db.get<UserRow>(["users", username]);

  if (!existingUser.value) {
    context.response.status = 401;
    context.response.body = { ok: false, reason: "NOTFOUND" };
    return;
  }

  const { hashedPassword } = existingUser.value;
  const match = await bcrypt.compare(password, hashedPassword);

  if (!match) {
    context.response.status = 401;
    context.response.body = { ok: false, reason: "BADPASS" };
    return;
  }

  const response = new Response();
  setCookie(response.headers, {
    name: "username",
    value: username,
  });

  db.close();
});

/**
 * Create account
 * Requires username, password, and verifyPassword in the body
 * Returns 200 and sets an HTTP cookie upon success and a 400 otherwise.
 */
router.post("/create", async ({ request, response }) => {
  const { username, password, verifyPassword } = (await request.body.json()) as AuthCredentials;
  if (password !== verifyPassword) {
    response.status = 400;
    response.body = { ok: false, reason: "Passwords don't match" };
    return;
  }

  const db = await Deno.openKv("./data/react-chat.sqlite");
  const userRow = await db.get<UserRow>(["users", username]);

  // If the user exists, let them know. Maybe just 400 to prevent iteration attacks?
  if (userRow.value !== null) {
    response.status = 400;
    response.body = { ok: false, reason: "Username is taken" };
    return;
  }

  // Add seasoning and store the user
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  const result = await db.set(["users", username], hashedPassword);
  console.log("User created", result);
  if (result.ok) {
    setCookie(response.headers, {
      name: AUTH_COOKIE_NAME,
      value: username,
      domain: "/",
      secure: true,
      httpOnly: true,
      maxAge: 31536000,
    });

    response.status = 201;
    response.body = { ok: true };
    return;
  }

  response.status = 500;
  response.body = { ok: true, reason: "Error creating user" };
});

/**
 * Logout
 * Delete the http cookie
 */
router.delete("/", ({ request, response }) => {
  deleteCookie(request.headers, AUTH_COOKIE_NAME);
  response.body = { ok: true };
});

// Debug
router.get("/", async ({ request, response }) => {
  if (request.ip !== "127.0.0.1") {
    response.status = 403;
    response.body = { ok: false };
    return;
  }

  const db = await Deno.openKv("./data/react-chat.sqlite");
  const all = db.list({ prefix: ["users"] });
  for await (const r of all) {
    console.log("user:", r);
  }
  response.body = { ok: true };
});

export default router.routes();
