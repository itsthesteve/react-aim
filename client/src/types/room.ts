export const DEFAULT_ROOM = import.meta.env.VITE_DEFAULT_ROOM ?? "abc";
export const ROOM_LOCALSTORAGE_KEY = import.meta.env.VITE_ROOM_LOCALSTORAGE_KEY ?? "__rcroom";

export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
}
