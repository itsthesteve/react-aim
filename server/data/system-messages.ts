import { Message } from "./models.ts";

// Sent when a new socket connection is created
const INITIAL_WELCOME: Message = {
  channel: "abc",
  data: {
    id: "admin" + Date.now(),
    owner: "Admin",
    payload: "Welcome, Please check the FAQ for rules and whatnot!",
  },
};

const json = (data: unknown): string => {
  return JSON.stringify(data);
};

export { INITIAL_WELCOME, json };
