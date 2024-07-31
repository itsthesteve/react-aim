const mockData = JSON.stringify({
  channel: "abc",
  data: [
    {
      id: "1",
      owner: "Admin",
      payload: "Welcome! Please check the FAQ for rules and whatnot.",
    },
    {
      id: "2",
      owner: "user2312312",
      payload: "Hello there",
    },
  ],
});

Bun.serve({
  port: 9000,
  fetch(req, server) {
    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: {
    message(ws, message) {
      console.log("message:", message);
    }, // a message is received
    open(ws) {
      // Send all messages on open
      console.log("opened");
      ws.send(mockData);
    }, // a socket is opened
    close(ws, code, message) {
      console.log("closed");
    }, // a socket is closed
    drain(ws) {
      console.log("drained");
    }, // the socket is ready to receive more data
  }, // handlers
});
