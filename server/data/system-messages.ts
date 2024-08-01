import { Message } from "./models.ts";

// Sent when a new socket connection is created
const INITIAL_WELCOME: Message = {
  channel: "abc",
  data: {
    id: "admin" + Math.round(Math.random() * 1000),
    owner: "Admin",
    payload: "Welcome, Please check the FAQ for rules and whatnot!",
  },
};

const json = (data: unknown): string => {
  return JSON.stringify(data);
};

export { INITIAL_WELCOME, json };
