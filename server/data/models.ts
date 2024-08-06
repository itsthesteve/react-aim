import "jsr:@std/dotenv/load";

// == Chat Messages ==
// Same as client/src/context/messages
export interface MessageData {
  id: string;
  owner: string;
  payload: string;
}

export interface Message {
  channel: string;
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

// Env driven
export const DEFAULT_ROOM = Deno.env.get("DEFAULT_ROOM") ?? "abc";
export const DENO_KV_PATH = Deno.env.get("DENO_KV_PATH") ?? "./data/react-chat.sqlite";
console.log("!!! KV_LOCATION=", DENO_KV_PATH);
