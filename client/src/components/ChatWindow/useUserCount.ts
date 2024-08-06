import { useCallback, useEffect, useRef, useState } from "react";
import logger from "../../logger";

export default function useUserCount(roomName: string) {
  const [userCount, setUserCount] = useState(0);
  const evtRef = useRef<EventSource>();

  const setPresence = useCallback(
    (present: boolean) => {
      return fetch("http://localhost:9000/presence", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          room: roomName,
          present,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    [roomName]
  );

  useEffect(() => {
    evtRef.current = new EventSource(`http://localhost:9000/presence?room=${roomName}`, {
      withCredentials: true,
    });

    evtRef.current.addEventListener("message", onMessage);
    evtRef.current.addEventListener("error", onError);

    function onMessage(message: MessageEvent) {
      const data = JSON.parse(message.data);
      console.log("presence:", data);
    }

    function onError(e: Event) {
      console.warn("!!! EventSource error", e);
    }

    setPresence(true).catch(logger.warn);
    return () => {
      setPresence(false)
        .then(() => {
          console.log("Cleaning up");
          evtRef.current?.removeEventListener("message", onMessage);
          evtRef.current?.removeEventListener("error", onError);
          evtRef.current?.close();
        })
        .catch(logger.warn);
      // leave
    };
  }, [roomName, setPresence]);
}
