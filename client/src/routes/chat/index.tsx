import { LoaderFunctionArgs, Navigate, useSearchParams } from "react-router-dom";
import ChatWindow from "../../components/ChatWindow";
import { MessagesProvider } from "../../context/messages/context";
import { DEFAULT_ROOM } from "../../types/room";
import { useEffect, useState } from "react";
import { isAuthorized } from "../../common";

export function ChatRoute() {
  const [authing, setAuthing] = useState({
    loading: true,
    authorized: false,
  });
  const [searchParams] = useSearchParams();
  const room = searchParams.get("room") ?? DEFAULT_ROOM;

  // Check that the user is allowed to enter the room we're trying to go to
  // If not, navigate to the home room, or eventually a 404 page
  useEffect(() => {
    const controller = new AbortController();
    isAuthorized(room, controller.signal).then((authorized) => {
      console.log("Is authorized?", authorized);
      setAuthing({ loading: false, authorized });
    });

    return () => controller.abort("Component reload");
  }, [room]);

  const { loading, authorized } = authing;
  if (loading) {
    return null;
  }

  if (!loading && !authorized) {
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
