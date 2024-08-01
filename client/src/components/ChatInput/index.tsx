import { FormEventHandler, useRef } from "react";
import styles from "./styles.module.css";
import { useMessages } from "../../context/messages/hook";

export default function ChatInput() {
  const { sendMessage } = useMessages();

  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      <form onSubmit={(e) => submitMessage(e)} className="py-2 mx-2 flex gap-2">
        <div className="field-row-stacked grow">
          <textarea ref={inputRef} rows={5}></textarea>
        </div>
        <button
          type="submit"
          className={`${styles.sendButton} rounded-md flex flex-col gap-2 w-16 items-center justify-center`}>
          <img src="/aimguy.png" width="32" height="32"></img>
          <span className="keyboard-ctrl">Send</span>
        </button>
      </form>
    </section>
  );
}
