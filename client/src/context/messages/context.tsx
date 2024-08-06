import { createContext, ReactNode, useCallback, useEffect, useRef } from "react";
import { useLoaderData } from "react-router-dom";
import logger from "../../logger";

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
  const eventSrcRef = useRef<EventSource>();
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
      console.log("sending message to", roomName);
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
  const load = useCallback(async () => {
    const response = await fetch(`http://localhost:9000/channel?room=${roomName}`, {
      method: "GET",
      credentials: "include",
    });

    return await response.json();
  }, [roomName]);

  useEffect(() => {
    logger.info(`Creating new event source for ${roomName}`);
    eventSrcRef.current = new EventSource(`http://localhost:9000/events?room=${roomName}`, {
      withCredentials: true,
    });

    const evt = eventSrcRef.current;
    evt.addEventListener("message", onMessage);
    evt.addEventListener("error", onError);
    window.addEventListener("beforeunload", () => {
      evt.close();
      console.log("Closing SSE", eventSrcRef.current?.readyState === EventSource.CLOSED);
    });

    function onMessage(message: MessageEvent) {
      const msg = JSON.parse(message.data);
      listeners.current[msg.channel]?.(msg.data);
    }

    function onError(e: Event) {
      console.warn("!!! EventSource error", e);
    }

    return () => {
      logger.warn(`Cleaning up event source for ${roomName}`);
      if (!evt) {
        return logger.warn("eventSrcRef is null");
      }
      evt.removeEventListener("message", onMessage);
      evt.removeEventListener("error", onError);
      evt.close();
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
