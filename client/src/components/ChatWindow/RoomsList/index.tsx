import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { ChatRoom } from "../../../types/room";

export default function UserList() {
  const roomName = useLoaderData();
  const [rooms, setRooms] = useState<{ user: ChatRoom[]; global: ChatRoom[] }>({
    user: [],
    global: [],
  });
  useEffect(() => {
    fetch("http://localhost:9000/rooms", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(({ userRooms, globalRooms }) => {
        setRooms({
          user: userRooms,
          global: globalRooms,
        });
      });
  }, []);
  return (
    <>
      <aside className="[grid-area:users] flex flex-col mt-3">
        <section className="tabs h-full">
          <menu role="tablist" aria-label="Sample Tabs">
            <button role="tab" aria-selected="true" aria-controls="tab-A">
              Rooms
            </button>
            <button role="tab" aria-controls="tab-B">
              Users
            </button>
          </menu>
          <article role="tabpanel" id="tab-A" className="h-full p-0 border-none">
            <ul className="tree-view h-full">
              <li>
                <details>
                  <summary>Global ({rooms.global.length})</summary>
                  <ul>
                    {rooms.global.map((room) => (
                      <li className={roomName === room.name ? "font-bold" : ""} key={room.id}>
                        {room.name}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
              <li>
                <details>
                  <summary>Your rooms ({rooms.user.length})</summary>
                  <ul>
                    {rooms.user.map((room) => (
                      <li key={room.id}>{room.name}</li>
                    ))}
                  </ul>
                </details>
              </li>
            </ul>
          </article>
          <article hidden role="tabpanel" id="tab-B" className="h-full p-0">
            <ul className="h-full p-0 list-none">
              <li className="p-1 hover:bg-slate-200">userdata</li>
            </ul>
          </article>
        </section>
      </aside>
    </>
  );
}
