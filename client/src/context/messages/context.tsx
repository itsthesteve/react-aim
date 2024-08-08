import { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import logger from "../../logger";
import { ChatLoaderType } from "../../routes/chat";
import { MessageError } from "./errors";

export const MessagesContext = createContext<MessageContextType | undefined>(undefined);

export interface MessageData {
  id: string;
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
  sendMessage: (message: Message) => void;
  load: () => Promise<MessageData[]>;
  loading: boolean;
};

type Props = {
  children: ReactNode;
};

export const MessagesProvider = ({ children }: Props) => {
  const eventSrcRef = useRef<EventSource>();
  const navigate = useNavigate();
  const { room } = useLoaderData() as ChatLoaderType;
  const listeners = useRef<Record<string, CallableFunction>>({});
  const [loading, setLoading] = useState(true);

  // Make sure we're allowed in the requested room. If not, redirect to /chat?room=abc
  useEffect(() => {
    const controller = new AbortController();
    setLoading(() => true);
    fetch(`http://localhost:9000/getRoom`, {
      method: "POST",
      credentials: "include",
      signal: controller.signal,
      body: JSON.stringify({ room }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        console.log({ res });
        if (!res.ok) {
          logger.warn("Ooopsie");
          navigate("/chat?room=abc");
        }
      })
      .finally(() => setLoading(false));

    return () => {
      controller.abort("New room chosen");
    };
  }, [room, navigate]);

  useEffect(() => {
    eventSrcRef.current = new EventSource(`http://localhost:9000/events?room=${room}`, {
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
    const response = await fetch(`http://localhost:9000/msg?room=${room}`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    if (!response.ok) {
      logger.warn("Unable to send message:", result);
      throw new MessageError(result.reason);
    }

    console.log("Message posted:", result);
  };

  /**
   * Retrieve all messages for the channel.
   * The roomName is retrieved from the chatLoader function set in the router.
   */
  const load = useCallback(async () => {
    const response = await fetch(`http://localhost:9000/channel?room=${room}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("Unable to get channel messages", response);
      // TODO: Navigate to 404
      navigate("/404", { replace: true });
    }

    return await response.json();
  }, [room]);

  return (
    <>
      <MessagesContext.Provider value={{ subscribe, unsubscribe, sendMessage, load, loading }}>
        {children}
      </MessagesContext.Provider>
    </>
  );
};
