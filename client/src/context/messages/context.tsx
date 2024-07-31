import { createContext, ReactNode, useEffect, useRef, useState } from "react";

export const MessagesContext = createContext<MessageContextType | undefined>(undefined);

// Message payload interface
export interface Message {
  id: string;
  owner: string;
  payload: string;
}

export interface WSNotification {
  type: "system" | "message";
  messages: Message[];
}

// React context interface
export type MessageContextType = {
  subscribe: (channel: string, fn: CallableFunction) => void;
  unsubscribe: (channel: string) => void;
  setUrl: (url: string) => void;
  socket: WebSocket | undefined;
  // socket: WebSocket | undefined;
  // loading: boolean;
};

type Props = {
  children: ReactNode;
};

export const MessagesProvider = ({ children }: Props) => {
  const [url, setUrl] = useState<string>("ws://localhost:9000/ws");
  const ws = useRef<WebSocket>();

  const listeners = useRef<Record<string, CallableFunction>>({});
  const subscribe = (channel: string, fn: CallableFunction) => {
    listeners.current[channel] = fn;
  };

  const unsubscribe = (channel: string) => delete listeners.current[channel];

  useEffect(() => {
    console.log("Creating new websocket", url);
    ws.current = new WebSocket(url);

    ws.current.addEventListener("message", onMessage);
    ws.current.addEventListener("close", onClose);

    return () => {
      if (!ws.current) {
        return console.warn("No websocket to tear down.");
      }

      console.log("useEffect cleanup... closing");
      ws.current.removeEventListener("message", onMessage);
      ws.current.removeEventListener("close", onClose);
      ws.current.close();
    };

    function onMessage(message: MessageEvent) {
      const msg = JSON.parse(message.data);
      listeners.current["abc"](msg);
    }

    function onClose(e: Event) {
      console.log("Closed", e);
    }
  }, [url, listeners]);

  return (
    <>
      <MessagesContext.Provider value={{ setUrl, subscribe, unsubscribe, socket: ws.current }}>
        {children}
      </MessagesContext.Provider>
    </>
  );
};
