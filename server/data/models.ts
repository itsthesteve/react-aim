// == Chat Messages ==
export interface MessageData {
  owner: string;
  payload: string;
}

export interface Message {
  room: string;
  data: MessageData;
}

// == Authentication ==
export interface User {
  id: string;
  username: string;
}

export interface UserRow extends User {
  hashedPassword: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
  verifyPassword: string;
}

export const DEFAULT_ROOM = Deno.env.get("DEFAULT_ROOM") ?? "abc";
