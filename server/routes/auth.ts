import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { db } from "../data/index.ts";
import { AuthCredentials, DEFAULT_ROOM, UserRow } from "../data/models.ts";
import { AUTH_COOKIE_NAME, AUTH_PRESENCE_COOKIE, COOKIE_OPTIONS } from "../cookies.ts";
import {
  AuthMiddleware,
  JsonResponseMiddleware,
  RateLimitMiddleware,
} from "../middleware/index.ts";

const router = new Router({
  prefix: "/auth",
});

router.use(JsonResponseMiddleware);

/**
 * Login
 * Requires username, password and password verfication in
 * the request body
 */
router.post("/login", async ({ response, request, cookies }) => {
  const { username, password } = await request.body.json();

  const existingUser = await db.get<string>(["users", username]);

  if (!existingUser.value) {
    response.status = 401;
    response.body = { ok: false, reason: "NOUSER" };
    return;
  }

  const match = await bcrypt.compare(password, existingUser.value);

  if (!match) {
    response.status = 401;
    response.body = { ok: false, reason: "BADPASS" };
    return;
  }

  // All good, set cookie and return ok
  await cookies.set(AUTH_COOKIE_NAME, username, COOKIE_OPTIONS);

  // Set the default presence room to the default room
  await cookies.set(AUTH_PRESENCE_COOKIE, DEFAULT_ROOM, COOKIE_OPTIONS);

  response.body = { ok: true, user: { username } };
});

/**
 * Create account
 * Requires username, password, and verifyPassword in the body
 * Returns 200 and sets an HTTP cookie upon success and a 400 otherwise.
 */
router.post("/create", await RateLimitMiddleware(), async ({ request, response }) => {
  const { username, password, verifyPassword } = (await request.body.json()) as AuthCredentials;
  if (password !== verifyPassword) {
    response.status = 400;
    response.body = { ok: false, reason: "Passwords don't match" };
    return;
  }

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

/**
 * Verifies the user is logged in via the http cookie
 */
router.get("/me", AuthMiddleware, async ({ response, cookies }) => {
  const cookieUsername = await cookies.get(AUTH_COOKIE_NAME);

  if (!cookieUsername) {
    response.status = 403;
    response.body = { ok: false, reason: "NOSESSION" };
    return;
  }

  // Ensure the user exists
  const user = await db.get(["users", cookieUsername]);
  if (!user.value) {
    response.status = 403;
    response.body = { ok: false, reason: "NOUSER" };
    return;
  }

  if (cookieUsername) {
    response.status = 200;
    response.body = { ok: true, user: { username: cookieUsername } };
    return;
  }

  response.body = { ok: false, reason: "NOSESSION" };
});

export default router.routes();
