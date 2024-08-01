import { useEffect, useState } from "react";
import { MessageData } from "../../context/messages/context";
import { useMessages } from "../../context/messages/hook";
import styles from "./styles.module.css";

export default function MessagesList() {
  const { subscribe, load } = useMessages();
  const [messages, setMessages] = useState<MessageData[]>([]);

  useEffect(() => {
    load().then((messages) => setMessages((prev: MessageData[]) => [...prev, ...messages]));
  }, []);

  subscribe("abc", (data: MessageData) => {
    setMessages((prev: MessageData[]) => [...prev, data]);
  });

  return (
    <section className={`p-2 bg-white mx-2 mt-2 ${styles.messageWindow}`}>
      <div>
        {messages.map((message) => {
          return (
            <p key={message.id} className="flex gap-1">
              <span className={styles.notMe}>xXSlayer420Xx:</span>
              <span>{message.payload}</span>
            </p>
          );
        })}
      </div>
    </section>
  );
}
