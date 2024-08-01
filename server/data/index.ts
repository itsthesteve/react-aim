import "jsr:@std/dotenv/load";
import { Message } from "./models.ts";

export const kv = await Deno.openKv("./data/react-chat.sqlite");

/**
 * (1) TODO: Once there's something that resembles authentication here,
 * set the randKey to something else to denote what was sent by me
 * and what is from other users.
 */
const getRandKey = (): string => {
  const rand = Math.round(Math.random() * 1_000_000);
  return `${Date.now()}_${rand}`;
};

export async function persistMessage(msg: Message) {
  console.log("Saving", msg);
  const result = await kv.set(["message", getRandKey() /* [1] */], msg);
  console.log(result);
}

export async function getAll() {
  const entries = kv.list({ prefix: ["message"] });
  for await (const entry of entries) {
    console.log(entry.key);
    console.log(entry.value);
  }
}
