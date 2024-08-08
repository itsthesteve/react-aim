type User = { user: { username: string } };
type UserResponse = { ok: boolean; user: User };

/**
 * Retrieve the currently logged in user, if exists.
 */
export async function getMe(): Promise<User | null> {
  const response = await fetch("http://localhost:9000/auth/me", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }
  const result: UserResponse = await response.json();

  return result.user;
}

/**
 * Verify the user is allowed to visit the given room
 */
export async function isAuthorizedForRoom(
  room: string,
  controller: AbortController
): Promise<boolean> {
  const response = await fetch(`http://localhost:9000/getRoom`, {
    method: "POST",
    credentials: "include",
    signal: controller.signal,
    body: JSON.stringify({ room }),
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    return false;
  }

  return true;
}
