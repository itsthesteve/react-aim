import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { MessageData } from "~/context/messages/context";
import { useMessagesContext } from "~/context/messages/hook";
import { ChatLoaderType } from "~/routes/chat";
import styles from "./styles.module.css";

import { getAuthState } from "~/store/auth";

function MessagesList() {
  const { user } = getAuthState();
  const { room } = useLoaderData() as ChatLoaderType;
  const { subscribe, getMessages } = useMessagesContext();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const messagesWrapper = useRef<HTMLElement>(null);

  /**
   * [1]
   * Load all the existing chats right off the bat, may not be necessary depending on how the
   * SSE endpoint is going to work
   *  NOTE: I'm leaving this for now until I do more testing. Seems to work with the latest changes
   */
  useEffect(() => {
    const controller = new AbortController();
    getMessages(controller.signal).then((messages) => setMessages(messages));

    return () => controller.abort("Room changed");
  }, [room, getMessages]);

  // Scroll to the bottom when a new message comes in
  useLayoutEffect(() => {
    messagesWrapper.current?.scrollTo({ top: messagesWrapper.current.scrollHeight });
  }, [messages.length]);

  subscribe(room as string, (data: MessageData) => {
    // Still need to figure out the message retrieval process, see [1] above
    // Something with the way the KV data is retrieved or... something.
    if (messages.find((pm) => pm.id === data.id)) {
      return console.warn("Duplicate message sent. Skipping.", data);
    }

    setMessages((prev: MessageData[]) => [...prev, data]);
  });

  return (
    <section ref={messagesWrapper} className={`p-2 bg-white mx-2 mt-2 ${styles.messageWindow}`}>
      <header>Welcome back, {user?.username}</header>
      {messages.map((message, i) => {
        return (
          <p key={i} className="flex gap-1 items-start">
            <span className={message.owner === user?.username ? styles.me : styles.notMe}>
              {message.owner}:
            </span>
            <span className="whitespace-pre">{message.payload}</span>
          </p>
        );
      })}
    </section>
  );
}

export default memo(MessagesList);
