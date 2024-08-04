import { createContext, ReactNode, useEffect, useRef, useState } from "react";

export const MessagesContext = createContext<MessageContextType | undefined>(undefined);

export interface MessageData {
  id: string;
  owner: string;
  payload: string;
}

// Message payload
export interface Message {
  channel: string;
  data: MessageData;
}

// React context interface
export type MessageContextType = {
  setChatId: (roomId: string) => void;
  subscribe: (channel: string, fn: CallableFunction) => void;
  unsubscribe: (channel: string) => void;
  sendMessage: (message: Message) => void;
  load: () => Promise<MessageData[]>;
  roomId: string;
};

type Props = {
  children: ReactNode;
};

export const MessagesProvider = ({ children }: Props) => {
  const [chatroomId, setChatroomId] = useState<string>("abc");
  const listeners = useRef<Record<string, CallableFunction>>({});

  const setChatId = (id: string) => {
    setChatroomId(id);
    console.log("Set room ID to", chatroomId);
  };

  const subscribe = (channel: string, fn: CallableFunction) => {
    listeners.current[channel] = fn;
  };

  const unsubscribe = (channel: string) => {
    delete listeners.current[channel];
  };

  const sendMessage = async (message: Message) => {
    try {
      const response = await fetch("http://localhost:9000/msg", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(await response.json());
    } catch (e) {
      console.warn("Error posting message", e);
    }
  };

  /**
   * Retrieve all messages for the channel.
   * TODO: Pass in the channel. This pulls messages
   * for the channel "ABC"
   */
  const load = async (): Promise<MessageData[]> => {
    const response = await fetch(`http://localhost:9000/channel?room=${chatroomId}`, {
      method: "GET",
      credentials: "include",
    });

    return await response.json();
  };

  useEffect(() => {
    const eventSrc = new EventSource(`http://localhost:9000/events?room=${chatroomId}`);
    eventSrc.addEventListener("message", onMessage);
    eventSrc.addEventListener("error", onError);

    function onMessage(message: MessageEvent) {
      const msg = JSON.parse(message.data);
      listeners.current[msg.channel]?.(msg.data);
    }

    function onError(e: Event) {
      console.error("!!!", e);
    }
  }, []);

  return (
    <>
      <MessagesContext.Provider
        value={{ subscribe, unsubscribe, sendMessage, load, setChatId, roomId: chatroomId }}>
        {children}
      </MessagesContext.Provider>
    </>
  );
};
