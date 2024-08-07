import { useContext } from "react";
import { MessagesContext } from "./context";

export function useMessagesContext() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider");
  }

  return context;
}
