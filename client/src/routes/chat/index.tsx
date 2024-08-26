import { LoaderFunctionArgs, Navigate } from "react-router-dom";
import ChatWindow from "~/components/ChatWindow";
import { ROOM_NAME_REGEX } from "~/consts";
import { MessagesProvider } from "~/context/messages/context";
import { getAuthState } from "~/store/auth";
import { ChatRoom, DEFAULT_ROOM } from "~/types/room";

export function ChatRoute() {
  const { loading, user } = getAuthState();

  if (loading) {
    return null;
  }

  if (!loading && !user) {
    return <Navigate to={`/chat?room=${DEFAULT_ROOM}`} />;
  }

  return (
    <MessagesProvider>
      <ChatWindow />
    </MessagesProvider>
  );
}

export type ChatLoaderType = {
  room: string;
  userRooms: { user: ChatRoom[]; global: ChatRoom[]; open: ChatRoom[] };
};

/**
 * Get the requested room or fallback to the default
 * TODO: Might not need this, or do more. Currently it's kinda worthless.
 */
export async function chatRouteLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const room = url.searchParams.get("room") ?? DEFAULT_ROOM;

  // // Check to make sure its valid in case someone mucks with it, redirect to default otherwise.
  console.log(ROOM_NAME_REGEX, room);
  if (!ROOM_NAME_REGEX.test(room)) {
    console.warn("Invalid room name, redirecting.");
    throw new Response("Invalid room name", { status: 400 });
  }

  const response = await fetch("/api/rooms", {
    method: "GET",
    credentials: "include",
  });
  const userRooms = await response.json();

  return {
    room,
    userRooms,
  };
}
