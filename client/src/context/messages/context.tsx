import { createContext, ReactNode, useEffect, useRef } from "react";
import { useLoaderData } from "react-router-dom";

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
  subscribe: (channel: string, fn: CallableFunction) => void;
  unsubscribe: (channel: string) => void;
  sendMessage: (message: Message) => void;
  load: () => Promise<MessageData[]>;
};

type Props = {
  children: ReactNode;
};

export const MessagesProvider = ({ children }: Props) => {
  const roomName = useLoaderData();
  const listeners = useRef<Record<string, CallableFunction>>({});

  const subscribe = (channel: string, fn: CallableFunction) => {
    listeners.current[channel] = fn;
  };

  const unsubscribe = (channel: string) => {
    delete listeners.current[channel];
  };

  const sendMessage = async (message: Message) => {
    try {
      const response = await fetch(`http://localhost:9000/msg?room=${roomName}`, {
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
   * The roomName is retrieved from the chatLoader function set in the router.
   */
  const load = async (): Promise<MessageData[]> => {
    const response = await fetch(`http://localhost:9000/channel?room=${roomName}`, {
      method: "GET",
      credentials: "include",
    });

    return await response.json();
  };

  useEffect(() => {
    console.log(
      `%c+++ Creating new event source for ${roomName}`,
      "background-color: lightgreen; color: black"
    );
    const eventSrc = new EventSource(`http://localhost:9000/events?room=${roomName}`, {
      withCredentials: true,
    });

    eventSrc.addEventListener("message", onMessage);
    eventSrc.addEventListener("error", onError);

    function onMessage(message: MessageEvent) {
      const msg = JSON.parse(message.data);
      listeners.current[msg.channel]?.(msg.data);
    }

    function onError(e: Event) {
      console.error("!!! EventSource error", e);
    }

    return () => {
      console.log(
        `%c+++ Cleaning up event source for ${roomName}`,
        "background-color: maroon; color: white"
      );
      eventSrc.removeEventListener("message", onMessage);
      eventSrc.removeEventListener("error", onError);
      eventSrc.close();
    };
  }, [roomName]);

  return (
    <>
      <MessagesContext.Provider value={{ subscribe, unsubscribe, sendMessage, load }}>
        {children}
      </MessagesContext.Provider>
    </>
  );
};
