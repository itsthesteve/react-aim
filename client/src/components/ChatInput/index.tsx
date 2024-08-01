import { useCallback, useRef, useState } from "react";
import { useMessages } from "../../context/messages/hook";
import KeyboardSpan from "../KeyboardSpan";
import styles from "./styles.module.css";

export default function ChatInput() {
  const { sendMessage } = useMessages();
  const [message, setMessage] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    if (!message.length) {
      return console.warn("Nothing to submit");
    }

    sendMessage({
      channel: "abc",
      data: {
        id: "",
        owner: "user123",
        payload: message,
      },
    });

    if (!textAreaRef.current) {
      return; // shouldn't happen, way past first render here
    }

    setMessage("");
    textAreaRef.current.value = "";
    textAreaRef.current.focus();
  };

  // Even though we're not using message in the callback, it's needed otherwise
  // the message is null. Not entirely sure why.
  const sendListener = useCallback(() => {
    submit();
  }, [message, submit]);

  return (
    <section className={styles.chatInput}>
      <div className="py-2 mx-2 flex gap-2">
        <div className="field-row-stacked grow">
          <textarea
            autoFocus
            ref={textAreaRef}
            className={styles.textarea}
            onChange={(e) => setMessage(() => e.target.value)}
            rows={5}></textarea>
        </div>
        <button
          onClick={submit}
          type="button"
          disabled={!message.length}
          className={`${styles.sendButton} rounded-md flex flex-col gap-2 w-16 items-center justify-center`}>
          <img src="/aimguy.png" width="32" height="32"></img>
          {/* <span className="keyboard-ctrl">Send</span> */}
          <KeyboardSpan listener={() => sendListener()}>Send</KeyboardSpan>
        </button>
      </div>
    </section>
  );
}
