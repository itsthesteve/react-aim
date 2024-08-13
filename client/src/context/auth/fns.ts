type User = { username: string };
type UserResponse = { ok: boolean; user: User };

/**
 * Retrieve the currently logged in user, if exists.
 */
export async function getMe({ signal }: { signal: AbortSignal }): Promise<User | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }
  const result: UserResponse = await response.json();

  return result.user;
}
