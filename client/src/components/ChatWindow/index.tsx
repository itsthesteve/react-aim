import { useCallback, useEffect, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import ChatInput from "../../components/ChatWindow/ChatInput";
import MessagesList from "../../components/ChatWindow/MessagesList";
import UserList from "../../components/ChatWindow/RoomsList";
import { ChatLoaderType } from "../../routes/chat";
import styles from "./styles.module.css";
import { useDraggable } from "../../hooks/useDraggable";

export default function ChatWindow() {
  const navigate = useNavigate();
  const elRef = useRef<HTMLDivElement | null>(null);
  const { room } = useLoaderData() as ChatLoaderType;
  const { x, y } = useDraggable(elRef);

  useEffect(() => {
    if (!elRef.current) return;
    elRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, [x, y]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <div className={`window ${styles.windowContainer}`} ref={(el) => (elRef.current = el)}>
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
          <ChatInput />
          <UserList />
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
  );
}
