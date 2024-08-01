import { useState } from "react";
import { useMessages } from "../../context/messages/hook";
import { MessageData } from "../../context/messages/context";

export default function MessagesList() {
  const { subscribe } = useMessages();
  const [messages, setMessages] = useState<MessageData[]>([]);

  subscribe("abc", (data: MessageData[]) => {
    setMessages((prev: MessageData[]) => [...prev, ...data]);
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
