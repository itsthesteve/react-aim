import ChatRoute from "../../routes/chat";
import { DEFAULT_ROOM, ROOM_LOCALSTORAGE_KEY } from "../../types/room";

export function ChatWindow() {
  return <ChatRoute />;
}

/**
 * Get's the last room the user was in, or the global default of DEFAULT_ROOM
 * This is passed (currently) to the MessageProvider in order to update the fetch calls based on
 * which room the user is in.
 */
export function chatRouteLoader() {
  const cachedRoom = localStorage.getItem(ROOM_LOCALSTORAGE_KEY);
  if (cachedRoom) {
    return cachedRoom;
  }

  const search = new URLSearchParams(document.location.search);
  const room = search.get("room") ?? DEFAULT_ROOM;

  // Check to make sure its valid in case someone mucks with it, redirect to default otherwise.
  if (!/^[a-z0-9]+$/i.test(room)) {
    return DEFAULT_ROOM;
  }

  return room;
}
