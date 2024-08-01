import { FormEventHandler, useRef } from "react";
import styles from "./styles.module.css";
import { useMessages } from "../../context/messages/hook";

export default function ChatInput() {
  const { sendMessage } = useMessages();

  const inputRef = useRef<HTMLInputElement>(null);

  const submitMessage: FormEventHandler = (e) => {
    e.preventDefault();
    if (!inputRef.current) {
      return console.warn("input ref not ready");
    }

    sendMessage({
      channel: "abc",
      data: {
        id: "",
        owner: "user123",
        payload: inputRef.current.value,
      },
    });
  };

  return (
    <section className={styles.chatInput}>
      <form onSubmit={(e) => submitMessage(e)}>
        <input ref={inputRef} />
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}
