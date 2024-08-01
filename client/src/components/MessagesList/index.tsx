import { useState } from "react";
import { useMessages } from "../../context/messages/hook";
import { MessageData } from "../../context/messages/context";
import styles from "./styles.module.css";

export default function MessagesList() {
  const { subscribe } = useMessages();
  const [messages, setMessages] = useState<MessageData[]>([]);

  subscribe("abc", (data: MessageData[]) => {
    setMessages((prev: MessageData[]) => [...prev, ...data]);
  });

  return (
    <section className={`p-2 bg-white mx-4 mt-4 ${styles.messageWindow}`}>
      <div>
        {messages.map((message) => {
          return (
            <p className="max-w-fit" key={message.id}>
              {message.payload}
            </p>
          );
        })}
      </div>
    </section>
  );
}
