import { useEffect, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { ChatLoaderType } from "../../../routes/chat";
import { ChatRoom } from "../../../types/room";

interface RoomListItemProps {
  /* Name of the room the chat window is currently servicing */
  currentRoom: string;

  /* The room object in the current iteration */
  listedRoom: ChatRoom;

  /* Prevents rendering of the global icon, redundant for "global" rooms */
  skipGlobalIcon?: boolean;
}

/**
 * Helper component for rendering each of the type of rooms in the list
 */
const RoomListItem = ({ skipGlobalIcon, currentRoom, listedRoom }: RoomListItemProps) => {
  return (
    <li
      title={listedRoom.isPublic ? "Public" : "Private"}
      className={`flex items-center gap-1 ${currentRoom === listedRoom.name ? "font-bold" : ""}`}
      key={listedRoom.id}>
      <Link to={`/chat?room=${listedRoom.name}`}>{listedRoom.name}</Link>
      {!skipGlobalIcon && listedRoom.isPublic && <img src="/public.png" width="12" height="12" />}
    </li>
  );
};

export default function UserList() {
  const { room } = useLoaderData() as ChatLoaderType;
  const [visibleTab, setVisibleTab] = useState(0);
  const [rooms, setRooms] = useState<{ user: ChatRoom[]; global: ChatRoom[]; public: ChatRoom[] }>({
    user: [],
    global: [],
    public: [],
  });

  useEffect(() => {
    fetch("http://localhost:9000/rooms", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(({ userRooms, globalRooms, publicRooms }) => {
        setRooms({
          user: userRooms,
          global: globalRooms,
          public: publicRooms,
        });
      });
  }, []);

  return (
    <>
      <aside className="[grid-area:users] flex flex-col mt-2">
        <section className="tabs flex flex-col grow overflow-hidden pt-[2px]">
          <menu role="tablist" aria-label="Sample Tabs">
            <button
              onClick={() => setVisibleTab(0)}
              role="tab"
              aria-selected={visibleTab === 0}
              aria-controls="tab-A">
              Rooms
            </button>
            <button
              aria-selected={visibleTab === 1}
              onClick={() => setVisibleTab(1)}
              role="tab"
              aria-controls="tab-B">
              Users
            </button>
          </menu>
          <article
            role="tabpanel"
            id="tab-A"
            className={`grow p-0 overflow-hidden flex-col ${visibleTab === 0 ? "flex" : "hidden"}`}>
            <ul className="tree-view">
              <li>
                <details open>
                  <summary>Global ({rooms.global.length})</summary>
                  <ul>
                    {rooms.global.map((globalRoom) => (
                      <li
                        className={globalRoom.name === room ? "font-bold" : ""}
                        key={globalRoom.id}>
                        <Link to="/chat">{globalRoom.name}</Link>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
              <li>
                <details open>
                  <summary>Your rooms ({rooms.user.length})</summary>
                  <ul>
                    {rooms.user.map((userRoom) => (
                      <RoomListItem key={userRoom.id} currentRoom={room} listedRoom={userRoom} />
                    ))}
                  </ul>
                </details>
              </li>
              <li>
                <details>
                  <summary>Public rooms ({rooms.public.length})</summary>
                  <ul>
                    {rooms.public.map((publicRoom) => (
                      <RoomListItem
                        skipGlobalIcon={true}
                        key={publicRoom.id}
                        currentRoom={room}
                        listedRoom={publicRoom}
                      />
                    ))}
                  </ul>
                </details>
              </li>
            </ul>
          </article>
          <article
            role="tabpanel"
            id="tab-B"
            className={`grow p-0 overflow-hidden flex-col ${visibleTab === 1 ? "flex" : "hidden"}`}>
            <p className="px-2 m-0 mt-2 text-center">
              Members of <strong>{room}</strong>
            </p>
            <hr className="mb-0" />
            <ul className="h-full m-0 p-0 list-none overflow-auto">
              {/* {online.map((user) => (
                <li key={user.username} className="px-2 py-1 hover:bg-slate-200">
                  {JSON.stringify(user)}
                </li>
              ))} */}
            </ul>
          </article>
        </section>
        <footer className="py-1 mb-2">
          <Link className="boxed-link" to="/create-room">
            Create room
          </Link>
        </footer>
      </aside>
    </>
  );
}
