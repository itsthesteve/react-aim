import { LoaderFunctionArgs } from "react-router-dom";
import { MessagesProvider } from "../../context/messages/context";
import ChatRoute from "../../routes/chat";
import { DEFAULT_ROOM } from "../../types/room";

export function ChatWindow() {
  return (
    <MessagesProvider>
      <ChatRoute />
    </MessagesProvider>
  );
}

/**
 * Get's the last room the user was in, or the global default of DEFAULT_ROOM
 * This is passed (currently) to the MessageProvider in order to update the fetch calls based on
 * which room the user is in.
 */
export function chatRouteLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const requestedRoom = url.searchParams.get("room");

  if (!requestedRoom) {
    return DEFAULT_ROOM;
  }

  // // Check to make sure its valid in case someone mucks with it, redirect to default otherwise.
  if (!/^[a-z0-9]+$/i.test(requestedRoom)) {
    console.warn("Invalid room name, redirecting.");
    return DEFAULT_ROOM;
  }

  return requestedRoom;
}
