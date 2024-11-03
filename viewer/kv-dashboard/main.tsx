import { Hono } from "hono";
import { css } from "hono/css";
import { Fragment } from "hono/jsx";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import type { FormattedUser, RateLimitValue } from "../types.ts";
import Layout from "./components/Layout.tsx";

config({ export: true });

const db = await Deno.openKv(Deno.env.get("DENO_KV_PATH"));
const app = new Hono();

app.get("/users", async (ctx) => {
  const userIter = db.list({ prefix: ["users"] });

  const users = [];
  for await (const user of userIter) {
    users.push(user);
  }

  const formatted: FormattedUser[] = users.map((user) => ({
    username: user.key[1],
    versiontimestamp: user.versionstamp,
  }));

  const listClass = css`
    border: 1px solid #ccc;
    margin: 0.5em auto;
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
  `;

  return ctx.html(
    <Layout>
      {formatted.map((f) => {
        return (
          <Fragment>
            <div className={listClass}>
              <input type="checkbox" name={f.username as string} />
              <div>{f.username}</div>
            </div>
          </Fragment>
        );
      })}
    </Layout>
  );
});

/**
 * Retrieve the list of ratelimited entries
 */
app.get("/ratelimit", async (ctx) => {
  const ip = ctx.req.query("ip");

  const searchKey = ["ratelimit"];

  if (ip) {
    searchKey.push(ip);
  }

  const list = db.list<RateLimitValue>({ prefix: searchKey });
  const entries = [];
  for await (const entry of list) {
    entries.push(entry);
  }

  const formatted = entries.map((entry: Deno.KvEntry<RateLimitValue>) => {
    const [, url, ip] = entry.key;
    const { remaining, lastRequestTimestamp } = entry.value;
    return {
      ip,
      url,
      remaining,
      lastRequestTimestamp,
    };
  });

  return ctx.json(formatted);
});

Deno.serve(app.fetch);
