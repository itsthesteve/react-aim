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
 * Get the requested room or fallback to the default
 * TODO: Might not need this, or do more. Currently it's kinda worthless.
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
