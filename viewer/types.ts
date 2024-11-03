// Query type for getting rate limit values
export type RateLimitValue = { remaining: number; lastRequestTimestamp: number };

export type FormattedUser = {
  username: Deno.KvKeyPart;
  versiontimestamp: string;
};
