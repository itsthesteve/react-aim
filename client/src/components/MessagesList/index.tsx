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
      <div>
        {messages.map((message) => {
          return (
            <p className="bg-blue-900 rounded-sm m-4 px-4 py-2 max-w-fit" key={message.id}>
              {message.payload}
            </p>
          );
        })}
      </div>
    </section>
  );
}
