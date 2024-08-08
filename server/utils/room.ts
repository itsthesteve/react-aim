import { type ChatRoom } from "../../client/src/types/room.ts";
import { db } from "../data/index.ts";

export async function canAccess(room: string, username: string): Promise<boolean> {
  // Ensure the user has permission to read the messages from the requested room
  const rows = await Array.fromAsync(db.list<ChatRoom>({ prefix: ["rooms"] }));
  const target = rows.find((row) => {
    // Key is ["room", "username", roomName]
    return row.key[2] === room;
  });

  if (!target || (!target.value.isPublic && target.value.createdBy !== username)) {
    return false;
  }

  return true;
}
