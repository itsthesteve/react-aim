import { createContext, ReactNode, useEffect, useRef } from "react";

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
  // const ws = useRef<WebSocket>();
  const listeners = useRef<Record<string, CallableFunction>>({});

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
    const response = await fetch("http://localhost:9000/channel", {
      method: "GET",
      credentials: "include",
    });

    return await response.json();
  };

  useEffect(() => {
    const eventSrc = new EventSource("http://localhost:9000/events");
    eventSrc.addEventListener("message", onMessage);
    eventSrc.addEventListener("error", onError);

    function onMessage(message: MessageEvent) {
      const msg = JSON.parse(message.data);
      console.log("Parsed message", msg);
      listeners.current[msg.channel]?.(msg.data);
    }

    function onError(e: Event) {
      console.error("!!!", e);
    }
  }, []);

  return (
    <>
      <MessagesContext.Provider value={{ subscribe, unsubscribe, sendMessage, load }}>
        {children}
      </MessagesContext.Provider>
    </>
  );
};
