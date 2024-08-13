/**
 * Determine if the user is authorized to enter the given room.
 */
export async function isAuthorized(room: string, signal: AbortSignal): Promise<boolean> {
  const res = await fetch(`/api/rooms/access?room=${room}`, {
    method: "GET",
    credentials: "include",
    signal,
    headers: { "Content-Type": "application/json" },
  });

  return res.ok;
}
