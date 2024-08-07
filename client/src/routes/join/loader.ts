import { LoaderFunctionArgs, redirect } from "react-router-dom";
import { DEFAULT_ROOM } from "../../types/room";

export async function joinLoader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room") ?? DEFAULT_ROOM;

  await fetch("http://localhost:9000/online", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ room }),
    headers: { "Content-Type": "application/json" },
  })
    .then(console.log)
    .catch(console.warn);

  return redirect(`/chat?room=${room}`);
}
