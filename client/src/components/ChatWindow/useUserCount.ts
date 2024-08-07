import { useCallback, useEffect, useRef, useState } from "react";
import logger from "../../logger";

export default function useUserCount(roomName: string) {
  const [users, setUsers] = useState([]);
  const evtRef = useRef<EventSource>();

  const setOnline = useCallback(
    (present: boolean) => {
      return fetch("http://localhost:9000/online", {
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
    setOnline(true)
      .then(() => {
        evtRef.current = new EventSource(`http://localhost:9000/online?room=${roomName}`, {
          withCredentials: true,
        });

        evtRef.current.addEventListener("message", onMessage);
        evtRef.current.addEventListener("error", onError);
      })
      .catch(logger.warn);

    function onMessage(message: MessageEvent) {
      const data = JSON.parse(message.data);
      setUsers(data);
    }

    function onError(e: Event) {
      console.log("!!! EventSource error", e);
    }
    return () => {
      setOnline(false)
        .then(() => {
          evtRef.current?.removeEventListener("message", onMessage);
          evtRef.current?.removeEventListener("error", onError);
          evtRef.current?.close();
        })
        .catch(logger.warn);
    };
  }, [roomName, setOnline]);

  return users;
}
