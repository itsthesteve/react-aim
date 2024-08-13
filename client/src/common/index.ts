/**
 * Determine if the user is authorized to enter the given room.
 */
export async function isAuthorized(room: string, signal: AbortSignal): Promise<boolean> {
  const res = await fetch(`/api/access`, {
    method: "POST",
    credentials: "include",
    signal,
    body: JSON.stringify({ room }),
    headers: { "Content-Type": "application/json" },
  });

  return res.ok;
}
