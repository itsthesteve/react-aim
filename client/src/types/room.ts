export const DEFAULT_ROOM = "abc";
export const ROOM_LOCALSTORAGE_KEY = "__rcroom";

export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
}
