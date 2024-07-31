const mockData = JSON.stringify([
  {
    id: "1",
    owner: "User123",
    payload: "hey there",
  },
  {
    id: "2",
    owner: "user989483",
    payload: "howdy",
  },
]);

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
