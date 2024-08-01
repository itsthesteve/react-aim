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
};

type Props = {
  children: ReactNode;
};

export const MessagesProvider = ({ children }: Props) => {
  const ws = useRef<WebSocket>();
  const listeners = useRef<Record<string, CallableFunction>>({});

  const subscribe = (channel: string, fn: CallableFunction) => {
    listeners.current[channel] = fn;
  };

  const unsubscribe = (channel: string) => {
    delete listeners.current[channel];
  };

  const sendMessage = (message: Message) => {
    if (!ws.current) {
      return console.warn("WS not ready yet.");
    }

    console.log("Sending", message);
    ws.current.send(JSON.stringify(message));
  };

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:9000/ws");

    ws.current.addEventListener("message", onMessage);
    ws.current.addEventListener("close", onClose);

    return () => {
      ws.current?.close();
    };

    function onMessage(message: MessageEvent) {
      const msg = JSON.parse(message.data);
      listeners.current[msg.channel]?.(msg.data);
    }

    function onClose(e: Event) {
      console.warn("Socket closed", e);
    }
  }, []);

  return (
    <>
      <MessagesContext.Provider value={{ subscribe, unsubscribe, sendMessage }}>
        {children}
      </MessagesContext.Provider>
    </>
  );
};
