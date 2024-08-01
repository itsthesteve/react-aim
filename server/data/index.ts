import "jsr:@std/dotenv/load";

const kv = await Deno.openKv("./data/react-chat.sqlite");

export async function getAll() {
  const entries = kv.list({ prefix: ["message"] });
  for await (const entry of entries) {
    console.log(entry.key);
    console.log(entry.value);
  }
}
