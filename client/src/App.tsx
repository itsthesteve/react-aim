import styles from "./app.module.css";
import ChatInput from "./components/ChatInput";
import MessagesList from "./components/MessagesList";
import UserList from "./components/UserList";
import { MessagesProvider } from "./context/messages/context";

function App() {
  return (
    <>
      <header>
        <h1>Chat</h1>
      </header>
      <MessagesProvider>
        <div className={styles.chatContainer}>
          <MessagesList />
          <ChatInput />
          <UserList />
        </div>
      </MessagesProvider>
    </>
  );
}

export default App;
