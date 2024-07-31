import "./App.css";
import MessagesList from "./components/MessagesList";
import { MessagesProvider } from "./context/messages/context";

function App() {
  return (
    <>
      <header>
        <h1>Chat</h1>
        <MessagesProvider>
          <MessagesList />
        </MessagesProvider>
      </header>
    </>
  );
}

export default App;
