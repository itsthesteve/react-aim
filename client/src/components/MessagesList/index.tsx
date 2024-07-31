import { useState } from "react";
import { useMessages } from "../../context/messages/hook";
import { Message } from "../../context/messages/context";

type MData = Message["data"];

export default function MessagesList() {
  const { subscribe } = useMessages();
  const [messages, setMessages] = useState<MData[]>([]);

  subscribe("abc", (data: MData[]) => {
    setMessages((prev) => [...prev, ...data]);
  });

  return (
    <section>
      <header>Messages:</header>
      <div>
        {messages.map((message) => {
          return <p key={message.id}>{message.payload}</p>;
        })}
      </div>
    </section>
  );
}
