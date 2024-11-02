import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";
import { z, ZodIssue } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { ZodError } from "https://deno.land/x/zod@v3.23.8/ZodError.ts";
import { AUTH_COOKIE_NAME, AUTH_PRESENCE_COOKIE, COOKIE_OPTIONS } from "../cookies.ts";
import { db } from "../data/index.ts";
import { DEFAULT_ROOM, UserRow } from "../data/models.ts";
import { AuthMiddleware, JsonResponseMiddleware } from "../middleware/index.ts";

const router = new Router({
  prefix: "/auth",
});

/** Minimum length for passwords */
const MIN_PWD_LEN = 6;
const MAX_PWD_LEN = 2 ** 16; // 16KiB - max size Deno KV supports

/** Minimum length for usernames */
const MIN_USERNAME_LEN = 3;
const MAX_USERNAME_LEN = 24; // Arbitrary

router.use(JsonResponseMiddleware);

/**
 * Login
 * Requires username, password and password verfication in
 * the request body
 */
router.post("/login", async ({ response, request, cookies }) => {
  const { username, password } = await request.body.json();

  const existingUser = await db.get<string>(["users", username]);

  // No user found
  if (!existingUser.value) {
    response.status = 401;
    response.body = { ok: false, reason: "Invalid credentials" };
    return;
  }

  const match = await bcrypt.compare(password, existingUser.value);

  // Bad password
  if (!match) {
    response.status = 401;
    response.body = { ok: false, reason: "Invalid credentials" };
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
router.post(
  "/create",
  // @ts-ignore Types are wonky due to multiple oak versions (I suspect)
  // TODO: Look into the rate limiter, seems to be off a bit
  // await RateLimitMiddleware(),
  async ({ request, response }) => {
    const body = await request.body.json();

    const zTrimStr = z.string().trim();
    const CreateUserSchema = z
      .object({
        username: zTrimStr
          .min(MIN_USERNAME_LEN, {
            message: `Username must be at least ${MIN_USERNAME_LEN} characters.`,
          })
          .max(MAX_USERNAME_LEN, {
            message: `Username must be at most ${MAX_USERNAME_LEN} characters.`,
          }),
        password: zTrimStr
          .min(MIN_PWD_LEN, { message: `Password must be at least ${MIN_PWD_LEN} characters.` })
          .max(MAX_PWD_LEN, { message: `Password must be at most ${MAX_PWD_LEN} characters.` }),

        verifyPassword: zTrimStr,
      })
      .refine((data) => data.password === data.verifyPassword, {
        message: "Passwords don't match",
      })
      .refine(
        async (data) => {
          const userRow = await db.get<UserRow>(["users", data.username]);
          return userRow.value === null;
        },
        {
          message: "Username is taken",
        }
      );

    try {
      await CreateUserSchema.parseAsync(body);
    } catch (e) {
      let reason;
      if (e instanceof ZodError) {
        reason = e.flatten((issue: ZodIssue) => ({
          message: issue.message,
          errorCode: issue.code,
        }));

        console.log("Error validating user", e, reason);
      }

      response.status = 400;
      response.body = {
        ok: false,
        reason,
      };
      return;
    }

    const { username, password } = body;

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
  }
);

/**
 * Logout
 * Delete the http cookie
 */
router.post("/logout", async (ctx) => {
  await ctx.cookies.delete(AUTH_COOKIE_NAME);
  console.log("logging out");
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
