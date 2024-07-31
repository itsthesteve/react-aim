const abortController = new AbortController();

const mockData = JSON.stringify({
  channel: "abc",
  data: [
    {
      id: "1",
      owner: "Admin",
      payload: "Welcome, Please check the FAQ for rules and whatnot.",
    },
    {
      id: "2",
      owner: "user2312312",
      payload: "Hello there",
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
      socket.send(mockData);
    });

    socket.addEventListener("message", (event) => {
      console.log("got a message", event);
    });

    return response;
  },
  port: 9000,
  signal: abortController.signal,
});

globalThis.addEventListener("unload", () => abortController.abort());
