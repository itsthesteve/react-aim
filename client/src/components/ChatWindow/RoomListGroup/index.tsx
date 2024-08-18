import { Link } from "react-router-dom";
import { ChatRoom } from "~/types/room";

interface RoomListProps {
  data: ChatRoom[];
  current: string;
  icon?: boolean;
}
/**
 * Helper component for rendering each of the type of rooms in the list
 */
export default function RoomListGroup({ data, current, icon = false }: RoomListProps) {
  return (
    <ul>
      {data.map((room) => (
        <li
          title={room.isPublic ? "Public" : "Private"}
          className={`flex items-center gap-1 ${current === room.name ? "font-bold" : ""}`}
          key={room.id}>
          <Link to={`/chat?room=${room.name}`}>{room.name}</Link>
          {icon && room.isPublic && <img src="/public.png" width="12" height="12" />}
        </li>
      ))}
    </ul>
  );
}
