import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import ChatInput from "../../components/ChatWindow/ChatInput";
import MessagesList from "../../components/ChatWindow/MessagesList";
import UserList from "../../components/ChatWindow/RoomsList";
import { useAuthContext } from "../../context/auth/hook";
import { ChatLoaderType } from "../../routes/chat";
import styles from "./styles.module.css";

export default function ChatWindow() {
  const { logout } = useAuthContext();
  const { room } = useLoaderData() as ChatLoaderType;
  const [loading, setLoading] = useState(true);
  const online = [];

  useEffect(() => {
    const controller = new AbortController();
    setLoading(() => true);
    fetch("http://localhost:9000/online", {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      body: JSON.stringify({ room }),
      headers: { "Content-Type": "application/json" },
    })
      .then(() => setLoading(() => false))
      .catch(console.warn);

    return () => {
      controller.abort("New room chosen");
    };
  }, [room]);

  return (
    <>
      <div className={`window ${styles.windowContainer}`}>
        <div className="title-bar">
          <div className="title-bar-text">React Chat | XP Edition</div>
          <div className="title-bar-controls">
            <button aria-label="Help" onClick={() => alert("todo")}></button>
            <button aria-label="Close" onClick={logout}></button>
          </div>
        </div>
        <div
          className={`window-body my-0 grid ${styles.content}`}
          style={{ background: "rgb(236, 233, 216)" }}>
          <div className={styles.chatContainer}>
            <MessagesList />
            <ChatInput disabled={loading} />
            <UserList online={online} />
          </div>
        </div>
        <div className="status-bar mx-0">
          <div className="flex">
            <p className="status-bar-field px-2">Current channel: {room}</p>
            {/* <p className="status-bar-field pr-2">{online?.length} member(s) online</p> */}
            <p className="status-bar-field pr-2">CPU Usage: 14%</p>
          </div>
        </div>
      </div>
    </>
  );
}
