import { useState, useEffect, useRef, useLayoutEffect } from "react";
import styles from "./styles.module.css";
import { useLoaderData } from "react-router-dom";
import { useAuthContext } from "../../../context/auth/hook";
import { MessageData } from "../../../context/messages/context";
import { useMessages } from "../../../context/messages/hook";

export default function MessagesList() {
  const { user } = useAuthContext();
  const roomName = useLoaderData();
  const { subscribe, load } = useMessages();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const messagesWrapper = useRef<HTMLElement>(null);

  // Load all the existing chats right off the bat, may not be necessary depending on how the
  // SSE endpoint is going to work
  // NOTE: I'm leaving this for now until I do more testing. Seems to work with the latest changes
  useEffect(() => {
    load().then((messages) => setMessages((prev: MessageData[]) => [...prev, ...messages]));
  }, []);

  useLayoutEffect(() => {
    messagesWrapper.current?.scrollTo({ top: messagesWrapper.current.scrollHeight });
  }, [messages.length]);

  subscribe(roomName as string, (data: MessageData) => {
    if (messages.find((pm) => pm.id === data.id)) {
      return console.warn("Duplicate message sent. Skipping.", data);
    }

    setMessages((prev: MessageData[]) => [...prev, data]);
  });

  return (
    <section ref={messagesWrapper} className={`p-2 bg-white mx-2 mt-2 ${styles.messageWindow}`}>
      <header>Welcome back, {user?.username}</header>
      {messages.map((message) => {
        return (
          <p key={message.id} className="flex gap-1 items-start">
            <span className={message.owner === user!.username ? styles.me : styles.notMe}>
              {message.owner}:
            </span>
            <span className="whitespace-pre">{message.payload}</span>
          </p>
        );
      })}
    </section>
  );
}
