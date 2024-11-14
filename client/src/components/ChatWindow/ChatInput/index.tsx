import { KeyboardEventHandler, useCallback, useRef, useState } from "react";
import { useLoaderData } from "react-router-dom";
import KeyboardSpan from "~/components/KeyboardSpan";
import { MessageError } from "~/context/messages/errors";
import { useMessagesContext } from "~/context/messages/hook";
import { ChatLoaderType } from "~/routes/chat";
import { getAuthState } from "~/store/auth";
import styles from "./styles.module.css";

export default function ChatInput() {
  const { user } = getAuthState();

  const { room } = useLoaderData() as ChatLoaderType;
  const { sendMessage } = useMessagesContext();
  const [err, setErr] = useState<string>("");
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
      room: room,
      data: {
        id: "", // set by the server
        owner: user!.username,
        payload: message,
      },
    }).catch((e) => {
      if (e instanceof MessageError) {
        setErr(e.reason);

        // Clear the error after a small delay
        setTimeout(() => {
          setErr("");
        }, 5000);
      } else {
        console.warn("Unknown error", e);
      }
    });

    // shouldn't happen, way past first render here
    if (!textAreaRef.current) {
      return;
    }

    setMessage("");
    textAreaRef.current.value = "";
    textAreaRef.current.focus();
  }, [message, sendMessage, user, room]);

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
          {err && <small className="bg-red-600 text-white font-bold p-2">{err}</small>}
        </div>
        <button
          onClick={submit}
          disabled={!message.length}
          className={`${styles.sendButton} p-0 m-0 border-0 bg-none flex flex-col gap-2 w-16 items-center justify-center`}>
          <img src="/aimguy-32.png" width="32" height="32"></img>
          <KeyboardSpan listener={() => sendListener()}>Send</KeyboardSpan>
        </button>
      </div>
    </section>
  );
}
