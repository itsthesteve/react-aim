import styles from "./app.module.css";
import ChatInput from "./components/ChatInput";
import MessagesList from "./components/MessagesList";
import UserList from "./components/UserList";
import { MessagesProvider } from "./context/messages/context";

function App() {
  return (
    <>
      <div className="title-bar">
        <div className="title-bar-text">A Title Bar</div>
        <div className="title-bar-controls"></div>
      </div>
      <div className={styles.content} style={{ background: "rgb(236, 233, 216)" }}>
        <MessagesProvider>
          <div className={styles.chatContainer}>
            <MessagesList />
            <ChatInput />
            <UserList />
          </div>
          <div className="status-bar mx-0">
            <div className="flex">
              <p className="status-bar-field pr-2">Current channel: Active</p>
              <p className="status-bar-field pr-2">4 members</p>
              <p className="status-bar-field pr-2">CPU Usage: 14%</p>
            </div>
          </div>
        </MessagesProvider>
      </div>
    </>
  );
}

export default App;
