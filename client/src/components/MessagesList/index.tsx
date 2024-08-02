import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { MessageData } from "../../context/messages/context";
import { useMessages } from "../../context/messages/hook";
import styles from "./styles.module.css";

export default function MessagesList() {
  const { subscribe, load } = useMessages();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const messagesWrapper = useRef<HTMLElement>(null);

  // Load all the existing chats right off the bat, may not be necessary depending on how the
  // SSE endpoint is going to work
  useEffect(() => {
    load().then((messages) => setMessages((prev: MessageData[]) => [...prev, ...messages]));
  }, []);

  useLayoutEffect(() => {
    messagesWrapper.current?.scrollTo({ top: Number.MAX_SAFE_INTEGER });
  }, [messages.length]);

  subscribe("abc", (data: MessageData) => {
    if (messages.find((pm) => pm.id === data.id)) {
      return console.warn("Duplicate message sent. Skipping.", data);
    }

    setMessages((prev: MessageData[]) => [...prev, data]);
  });

  return (
    <section ref={messagesWrapper} className={`p-2 bg-white mx-2 mt-2 ${styles.messageWindow}`}>
      {messages.map((message) => {
        return (
          <p key={message.id} className="flex gap-1 items-center">
            <span className={styles.notMe}>{message.owner}</span>
            <span>
              {message.payload}
              <kbd className="bg-slate-200 ml-2 p-1 inline-block">{message.id}</kbd>
            </span>
          </p>
        );
      })}
    </section>
  );
}
