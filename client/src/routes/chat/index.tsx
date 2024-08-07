import { LoaderFunctionArgs } from "react-router-dom";
import ChatWindow from "../../components/ChatWindow";
import { MessagesProvider } from "../../context/messages/context";
import { DEFAULT_ROOM } from "../../types/room";

export function ChatRoute() {
  console.log("ChatRoute()");
  return (
    <MessagesProvider>
      <ChatWindow />
    </MessagesProvider>
  );
}

export type ChatLoaderType = {
  room: string;
};

/**
 * Get the requested room or fallback to the default, passing that to an endpoint that sets
 * an HTTP cookie. This cookie is checked before messages are allowed to prevent spamming the
 * /msg endpoint with just a search param to post messages.
 */
export async function chatRouteLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const room = url.searchParams.get("room") ?? DEFAULT_ROOM;

  // // Check to make sure its valid in case someone mucks with it, redirect to default otherwise.
  if (!/^[a-z0-9]+$/i.test(room)) {
    console.warn("Invalid room name, redirecting.");
    throw new Response("Invalid room name", { status: 400 });
  }

  return {
    room,
  };
}
