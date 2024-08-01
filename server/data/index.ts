import "jsr:@std/dotenv/load";
import { Message } from "./models.ts";

const kv = await Deno.openKv("./data/react-chat.sqlite");

const getRandKey = (): string => {
  const rand = Math.round(Math.random() * 1_000_000);
  return `${Date.now()}_${rand}`;
};

/**
 * TODO: Once there's something that resembles authentication here,
 * set the randKey to something else to denote what was sent by me
 * and what is from other users.
 */
export async function persistMessage(msg: Message) {
  console.log("Saving", msg);
  const result = await kv.set(["message", getRandKey()], msg);
  console.log(result);
}

export async function getAll() {
  const entries = kv.list({ prefix: ["message"] });
  for await (const entry of entries) {
    console.log(entry.key);
    console.log(entry.value);
  }
}
