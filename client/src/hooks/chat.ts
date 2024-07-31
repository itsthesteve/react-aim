import { useState, useEffect, useRef } from "react";

export function useChatSocket(url: string = "ws://localhost:9000/ws") {
  if (!URL.canParse(url)) {
    throw new Error("Invalid URL");
  }

  const [loading, setLoading] = useState<boolean>(false);
  const ws = useRef<WebSocket>();

  useEffect(() => {
    console.log("Creating new websocket");
    ws.current = new WebSocket(url);

    ws.current.addEventListener("open", onOpen);
    ws.current.addEventListener("message", onMessage);
    ws.current.addEventListener("close", onClose);

    return () => {
      if (!ws.current) {
        return console.warn("No websocket to tear down.");
      }

      ws.current.removeEventListener("open", onOpen);
      ws.current.removeEventListener("message", onMessage);
      ws.current.removeEventListener("close", onClose);
      ws.current.close();
    };
  }, [url]);

  // Exported functions
  function sendMessage(message: string) {
    if (loading || !ws.current) {
      // TODO: queue the messages?
      return console.warn("ws still loading");
    }

    ws.current.send(message);
  }

  // WS listeners
  function onOpen(e: Event) {
    setLoading(false);
    console.log("Opened", e);
  }

  function onMessage(e: Event) {
    console.log("Message", e);
  }

  function onClose(e: Event) {
    console.log("Closed", e);
  }

  return {
    loading,
    sendMessage,
  };
}
