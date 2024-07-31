import "./App.css";
import { useChatSocket } from "./hooks/chat";

function App() {
  const { loading, sendMessage } = useChatSocket();

  return (
    <>
      <div>{loading}</div>
      <button onClick={() => sendMessage("hello")}>Send</button>
    </>
  );
}

export default App;
