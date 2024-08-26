import { useEffect } from "react";
import { useLoaderData, useLocation } from "react-router-dom";
import { ChatLoaderType } from "~/routes/chat";
import { getAuthState, User } from "~/store/auth";

export type UserPresence = {
  users: User[];
  state: string;
};

type BeaconEvents = "visibilitychange" | "pagehide" | "load" | "logout";

function updateUserPresence(event: BeaconEvents, user: User, room: string, present: boolean) {
  navigator.sendBeacon("/api/rooms/presence", JSON.stringify({ event, user, room, present }));
}

/**
 * Sends a beacon with information about the users presence, or if they've closed
 * the window entirely. Seems like this could be more elegant.
 */
export function usePresence() {
  const { user } = getAuthState();
  const loaderData = useLoaderData() as ChatLoaderType;
  const location = useLocation();

  useEffect(() => {
    if (!user || !loaderData?.room) {
      return console.warn("No user or room found for beacon calls.", loaderData, user);
    }

    const room = loaderData.room;

    // Create a reference in order to remove the event in cleanup
    const visChangedListener = (e: Event) => {
      updateUserPresence(e.type as BeaconEvents, user, room, !document.hidden);
    };

    const onBeforeUnloadListener = () => updateUserPresence("pagehide", user, room, false);

    // Attach events and initialize user state
    document.addEventListener("visibilitychange", visChangedListener);
    window.addEventListener("pagehide", onBeforeUnloadListener);
    updateUserPresence("load", user, room, true);

    return () => {
      updateUserPresence("pagehide", user, room, false);
      document.removeEventListener("visibilitychange", visChangedListener);
      window.removeEventListener("pagehide", onBeforeUnloadListener);
    };
  }, [loaderData, user, location.search]);

  return () => {
    if (!user) {
      return;
    }

    updateUserPresence("logout", user, loaderData?.room, false);
  };
}
