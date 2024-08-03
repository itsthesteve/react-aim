import { deleteCookie, getCookies, setCookie } from "https://deno.land/std/http/cookie.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { Context, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { AuthCredentials, UserRow } from "../data/models.ts";
import { responseRange } from "jsr:@oak/commons@0.11/range";
import { createMockNext } from "https://deno.land/x/oak@v16.1.0/testing.ts";
import { STATUS_TEXT } from "https://deno.land/x/oak@v16.1.0/deps.ts";

const router = new Router({
  prefix: "/auth",
});

const AUTH_COOKIE_NAME = "__rcsession";

/**
 * Login
 * Requires username, password and password verfication in
 * the request body
 */
router.post("/login", async ({ response, request }) => {
  const { username, password } = await request.body.json();

  const db = await Deno.openKv("./data/react-chat.sqlite");
  const existingUser = await db.get<string>(["users", username]);

  if (!existingUser.value) {
    response.status = 401;
    response.body = { ok: false, reason: "NOTFOUND" };
    return;
  }

  const match = await bcrypt.compare(password, existingUser.value);

  if (!match) {
    response.status = 401;
    response.body = { ok: false, reason: "BADPASS" };
    return;
  }

  // All good, set cookie and return ok
  setCookie(response.headers, {
    name: AUTH_COOKIE_NAME,
    value: username,
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 31536000,
  });

  response.body = { ok: true };

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
router.post("/logout", (ctx) => {
  ctx.cookies.delete(AUTH_COOKIE_NAME);
  ctx.response.status = 200;
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

/**
 * Verifies the user is logged in via the http cookie
 */
router.get("/me", ({ request, response }) => {
  const cookies = getCookies(request.headers);

  if (cookies[AUTH_COOKIE_NAME]) {
    response.status = 200;
    response.body = { ok: true, user: { username: cookies[AUTH_COOKIE_NAME] } };
    return;
  }

  response.body = { ok: false, reason: "NOSESSION" };
});

export default router.routes();
