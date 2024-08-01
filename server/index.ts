import { getAll, persistMessage } from "./data/index.ts";

const abortController = new AbortController();

const initialMessage = JSON.stringify({
  channel: "abc",
  data: [
    {
      id: "",
      owner: "Admin",
      payload: "Welcome, Please check the FAQ for rules and whatnot.",
    },
  ],
});

Deno.serve({
  handler: (req) => {
    if (req.headers.get("upgrade") != "websocket") {
      return new Response(null, { status: 501 });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.addEventListener("open", () => {
      socket.send(initialMessage);
    });

    socket.addEventListener("message", async (event) => {
      try {
        const obj = JSON.parse(event.data);
        await persistMessage(obj);
      } catch (e) {
        console.warn("Unable to persist message", e);
      }
    });

    return response;
  },
  port: 9000,
  signal: abortController.signal,
});

globalThis.addEventListener("unload", () => abortController.abort());
