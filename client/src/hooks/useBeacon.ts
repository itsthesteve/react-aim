import { useCallback, useEffect } from "react";
import { useLoaderData, useLocation } from "react-router-dom";
import { ChatLoaderType } from "~/routes/chat";
import { getAuthState, User } from "~/store/auth";

function sendBeacon(event: string, user: User, room: string, present: boolean) {
  navigator.sendBeacon("/api/debug/test", JSON.stringify({ event, user, room, present }));
}

/**
 * Sends a beacon with information about the users presence, or if they've closed
 * the window entirely. Seems like this could be more elegant.
 * TODO: Clean up this mess.
 */
export default function useBeacon() {
  const { user } = getAuthState();
  const { room } = useLoaderData() as ChatLoaderType;
  const location = useLocation();

  const onVizChange = useCallback(
    (e: Event) => {
      sendBeacon(e.type, user!, room, document.visibilityState === "visible");
    },
    [room, user]
  );

  const onBeforeUnload = useCallback(() => {
    sendBeacon("unload", user!, room, false);
  }, []);

  useEffect(() => {
    if (!user) return () => {};

    document.addEventListener("visibilitychange", onVizChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    sendBeacon("load", user, room, true);

    return () => {
      document.removeEventListener("visibilitychange", onVizChange);
    };
  }, [room, user, onVizChange, onBeforeUnload, location.search]);

  return () => {
    sendBeacon("logout", user!, room, false);
  };
}
