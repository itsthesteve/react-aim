export const DEFAULT_ROOM = import.meta.env.VITE_DEFAULT_ROOM ?? "abc";

export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  public: boolean;
}
