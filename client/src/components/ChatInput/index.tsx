import { KeyboardEventHandler, useCallback, useRef, useState } from "react";
import { useMessages } from "../../context/messages/hook";
import KeyboardSpan from "../KeyboardSpan";
import styles from "./styles.module.css";
import { useAuthContext } from "../../context/auth/hook";

export default function ChatInput() {
  const { user } = useAuthContext();
  const { sendMessage } = useMessages();
  const [message, setMessage] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const checkEnterKey: KeyboardEventHandler = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      submit();
      e.preventDefault();
      return false;
    }
  };

  const submit = useCallback(() => {
    if (!message.length) {
      return console.warn("Nothing to submit");
    }

    sendMessage({
      channel: "abc",
      data: {
        id: "msg-" + Date.now(),
        owner: user!.username,
        payload: message,
      },
    });

    // shouldn't happen, way past first render here
    if (!textAreaRef.current) {
      return;
    }

    setMessage("");
    textAreaRef.current.value = "";
    textAreaRef.current.focus();
  }, [message, sendMessage, user]);

  const sendListener = useCallback(() => {
    submit();
  }, [submit]);

  return (
    <section className={styles.chatInput}>
      <div className="py-2 mx-2 flex gap-2">
        <div className="field-row-stacked grow">
          <textarea
            autoFocus
            ref={textAreaRef}
            className={styles.textarea}
            onKeyDown={checkEnterKey}
            onChange={(e) => setMessage(() => e.target.value)}
            rows={5}></textarea>
        </div>
        <button
          onClick={submit}
          disabled={!message.length}
          className={`${styles.sendButton} rounded-md flex flex-col gap-2 w-16 items-center justify-center`}>
          <img src="/aimguy.png" width="32" height="32"></img>
          <KeyboardSpan listener={() => sendListener()}>Send</KeyboardSpan>
        </button>
      </div>
    </section>
  );
}
