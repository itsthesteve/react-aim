import ChatInput from "../../components/ChatInput";
import MessagesList from "../../components/MessagesList";
import UserList from "../../components/RoomsList";
import { useAuthContext } from "../../context/auth/hook";
import styles from "./app.module.css";

export default function ChatRoute() {
  const { logout } = useAuthContext();

  return (
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
          <ChatInput />
          <UserList />
        </div>
      </div>
      <div className="status-bar mx-0">
        <div className="flex">
          <p className="status-bar-field px-2">Current channel: Active</p>
          <p className="status-bar-field pr-2">4 members</p>
          <p className="status-bar-field pr-2">CPU Usage: 14%</p>
        </div>
      </div>
    </div>
  );
}
