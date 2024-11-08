import { Link } from "react-router-dom";
import { ChatRoom } from "~/types/room";

interface RoomListProps {
  data: ChatRoom[];
  current: string;
  title: string;
  open?: boolean;
  showIcon?: boolean;
}

/**
 * Helper component for rendering each of the type of rooms in the list
 */
export default function RoomListGroup({
  data,
  current,
  title,
  open = false,
  showIcon = false,
}: RoomListProps) {
  return (
    <details open={open}>
      <summary>
        {title} ({data.length})
      </summary>
      <ul>
        {data.map((room) => (
          <li
            aria-label={room.name}
            title={room.isPublic ? "Public" : "Private"}
            className={`flex items-center gap-1 ${current === room.name ? "font-bold" : ""}`}
            key={room.id}>
            <Link to={`/chat?room=${room.name}`}>{room.name}</Link>
            {showIcon && room.isPublic && <img src="/public.png" width="12" height="12" />}
          </li>
        ))}
      </ul>
    </details>
  );
}
