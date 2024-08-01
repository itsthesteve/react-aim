import { FormEventHandler, useRef, useState } from "react";
import { useMessages } from "../../context/messages/hook";
import styles from "./styles.module.css";

export default function ChatInput() {
  const { sendMessage } = useMessages();
  const [message, setMessage] = useState<string>("");

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submitMessage: FormEventHandler = (e) => {
    e.preventDefault();

    sendMessage({
      channel: "abc",
      data: {
        id: "",
        owner: "user123",
        payload: message,
      },
    });

    if (!inputRef.current) {
      return;
    }

    // Seems like there's a better way to do this
    setMessage("");
    inputRef.current.value = "";
  };

  return (
    <section className={styles.chatInput}>
      <form onSubmit={(e) => submitMessage(e)} className="py-2 mx-2 flex gap-2">
        <div className="field-row-stacked grow">
          <textarea ref={inputRef} onChange={(e) => setMessage(e.target.value)} rows={5}></textarea>
        </div>
        <button
          type="submit"
          disabled={!message.length}
          className={`${styles.sendButton} rounded-md flex flex-col gap-2 w-16 items-center justify-center`}>
          <img src="/aimguy.png" width="32" height="32"></img>
          <span className="keyboard-ctrl">Send</span>
        </button>
      </form>
    </section>
  );
}
