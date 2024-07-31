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
      console.log("opened");
    }, // a socket is opened
    close(ws, code, message) {
      console.log("closed");
    }, // a socket is closed
    drain(ws) {
      console.log("drained");
    }, // the socket is ready to receive more data
  }, // handlers
});
