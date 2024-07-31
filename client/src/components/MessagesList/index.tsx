import { useState } from "react";
import { useMessages } from "../../context/messages/hook";
import { Message } from "../../context/messages/context";

export default function MessagesList() {
  const { subscribe } = useMessages();
  const [messages, setMessages] = useState<Message[]>([]);

  subscribe("abc", (data: Message[]) => {
    console.log("In component", data);
    setMessages(() => data);
  });

  return (
    <>
      <header>Messages:</header>
      <div>
        {messages.map((message: Message) => {
          return <p key={message.id}>{message.payload}</p>;
        })}
      </div>
    </>
  );
}
