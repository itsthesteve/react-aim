import { FormEventHandler, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getAuthState } from "../../store/auth";
import { ChatRoom } from "../../types/room";

export default function CreateRoomWindow() {
  const [roomName, setRoomName] = useState<string>();
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>();
  const [isErr, setIsErr] = useState<boolean>(false);

  const navigate = useNavigate();
  const { user } = getAuthState();
  const rooms = useLoaderData() as ChatRoom[];

  if (!user) {
    return null;
  }

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:9000/rooms", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ room: roomName, isPublic }),
    });

    const res = await response.json();
    if (!res.ok) {
      console.warn("Unable to create room", e);
      setSubmitted(false);
      setIsErr(true);
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      navigate(`/chat?room=${res.roomValue.name}`, { replace: true });
    }, 3000);
  };

  const changePublicMode: FormEventHandler<HTMLInputElement> = (e) => {
    setIsPublic(e.currentTarget.checked);
  };

  return (
    <>
      <div className="window" style={{ maxWidth: "min-content" }}>
        <div className="title-bar">
          <div className="title-bar-text">Create room</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={() => alert("todo")}></button>
          </div>
        </div>
        <div className="window-body grid place-items-center">
          <header className="bg-blue-700 w-40 aspect-square text-center font-sans font-bold flex flex-col text-white justify-between p-4">
            <img className="self-end" src="/aimguy.png" width="112" height="122" />
            React Instant Messenger
          </header>
          <form className="w-full py-4" onSubmit={onSubmit}>
            {!submitted ? (
              <>
                <label htmlFor="roomName" className="px-2 flex flex-col gap-1 items-stretch">
                  <span>Room name</span>
                  <input
                    onChange={(e) => setRoomName(e.target.value)}
                    name="roomName"
                    placeholder={`i.e. xX${user.username}SlayerXx`}
                  />
                  {isErr && (
                    <div className="py-1 text-red-700">
                      Unable to create room. Try another name.
                    </div>
                  )}
                </label>
                <div className="p-2">
                  <input onChange={changePublicMode} type="checkbox" id="isPublic" />
                  <label htmlFor="isPublic">Public</label>

                  {isPublic && (
                    <>
                      <div className="pt-2 break-words max-w-40">
                        Note: Public rooms can be joined by <em>anyone</em>.
                      </div>
                    </>
                  )}
                </div>
                <section className="mx-2 mt-4 p-">
                  <header>Your rooms</header>
                  <ul className="p-0 m-0 list-none bg-white mt-2 h-24 overflow-auto">
                    {rooms.map((room) => (
                      <li className="px-2 py-1" key={room.id}>
                        {room.name}
                      </li>
                    ))}
                  </ul>
                </section>
                <footer className="mt-4 text-center">
                  <button>Create room</button>
                </footer>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="font-bold pb-2">Room created!</div> Redirecting...
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
