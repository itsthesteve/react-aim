import { createContext, ReactNode, useCallback, useEffect, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import logger from "~/logger";
import { ChatLoaderType } from "~/routes/chat";
import { MessageError } from "./errors";

export const MessagesContext = createContext<MessageContextType | undefined>(undefined);

export interface MessageData {
  owner: string;
  payload: string;
}

// Message payload
export interface Message {
  room: string;
  data: MessageData;
}

// React context interface
export type MessageContextType = {
  subscribe: (room: string, fn: CallableFunction) => void;
  unsubscribe: (room: string) => void;
  sendMessage: (message: Message) => Promise<void>;
  getMessages: (signal: AbortSignal) => Promise<MessageData[]>;
};

type Props = {
  children: ReactNode;
};

export const MessagesProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  const { room } = useLoaderData() as ChatLoaderType;

  const eventSrcRef = useRef<EventSource>();
  const listeners = useRef<Record<string, CallableFunction>>({});

  useEffect(() => {
    eventSrcRef.current = new EventSource(`/api/chat/messages?room=${room}`, {
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
      listeners.current[msg.room]?.(msg.data);
    }

    function onError(e: Event) {
      console.warn("!!! EventSource error", e);
    }

    return () => {
      if (!evt) {
        return logger.warn("eventSrcRef is null");
      }
      evt.removeEventListener("message", onMessage);
      evt.removeEventListener("error", onError);
      evt.close();
    };
  }, [room]);

  const subscribe = (room: string, fn: CallableFunction) => {
    listeners.current[room] = fn;
  };

  const unsubscribe = (room: string) => {
    delete listeners.current[room];
  };

  /**
   * @throws {MessageError}
   */
  const sendMessage = async (message: Message) => {
    const response = await fetch(`/api/chat/message?room=${room}`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new MessageError(result.error);
    }

    console.log("Message posted:", result);
    return result;
  };

  /**
   * Retrieve all messages for the channel.
   * The roomName is retrieved from the chatLoader function set in the router.
   */
  const getMessages = useCallback(
    async (signal: AbortSignal) => {
      const response = await fetch(`/api/chat/?room=${room}`, {
        method: "GET",
        credentials: "include",
        signal,
      });

      if (!response.ok) {
        console.warn("Unable to get channel messages", response);
        navigate("/404", { replace: true });
      }

      return await response.json();
    },
    [room, navigate]
  );

  return (
    <>
      <MessagesContext.Provider value={{ subscribe, unsubscribe, sendMessage, getMessages }}>
        {children}
      </MessagesContext.Provider>
    </>
  );
};
