import { Message } from "./models.ts";

const kv = await Deno.openKv("./messages.sqlite");

export async function persistMessage(data: Message) {
  await kv.set(["message"], data);
}
