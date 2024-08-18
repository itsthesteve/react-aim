import { memo, useState } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { ChatLoaderType } from "~/routes/chat";
import { User } from "~/store/auth";
import RoomListGroup from "../RoomListGroup";

function UserList({ users }: { users: { user: User; state: string }[] }) {
  const { room, userRooms } = useLoaderData() as ChatLoaderType;
  const [visibleTab, setVisibleTab] = useState(0);

  return (
    <>
      <aside className="[grid-area:users] flex flex-col mt-2">
        <section className="tabs flex flex-col grow overflow-hidden pt-[2px]">
          <menu role="tablist" aria-label="Sample Tabs">
            <button
              onClick={() => setVisibleTab(0)}
              role="tab"
              aria-selected={visibleTab === 0}
              aria-controls="rooms-tab">
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
            id="rooms-tab"
            className={`grow p-0 overflow-hidden flex-col ${visibleTab === 0 ? "flex" : "hidden"}`}>
            <ul className="tree-view" aria-label="List of rooms">
              <li>
                <RoomListGroup title="Global" open={true} data={userRooms.global} current={room} />
              </li>
              <li>
                <RoomListGroup title="Your rooms" data={userRooms.user} current={room} />
              </li>
              <li>
                <RoomListGroup
                  title="Public rooms"
                  data={userRooms.open}
                  current={room}
                  icon={true}
                />
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
              {users.map((entry) => (
                <li key={entry.user.username} className="px-2 py-1 hover:bg-slate-200">
                  {entry.user.username} ({entry.state})
                </li>
              ))}
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

export default memo(UserList);
