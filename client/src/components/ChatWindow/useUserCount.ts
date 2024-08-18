import { useEffect, useRef, useState } from "react";

export default function usePresence(room: string) {
  const [users, setUsers] = useState([]);
  const evtRef = useRef<EventSource>();

  useEffect(() => {
    evtRef.current = new EventSource(`/api/rooms/presence?room=${room}`, {
      withCredentials: true,
    });

    evtRef.current.addEventListener("message", onMessage);
    evtRef.current.addEventListener("error", onError);

    function onMessage(message: MessageEvent) {
      const data = JSON.parse(message.data);
      console.log("onMessage", data);
      setUsers(data);
    }

    function onError(e: Event) {
      console.log("!!! EventSource error", e);
    }
    return () => {
      evtRef.current?.removeEventListener("message", onMessage);
      evtRef.current?.removeEventListener("error", onError);
      evtRef.current?.close();
    };
  }, [room]);

  return users;
}
