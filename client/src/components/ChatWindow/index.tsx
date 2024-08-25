import { useLoaderData } from "react-router-dom";
import ChatInput from "~/components/ChatWindow/ChatInput";
import MessagesList from "~/components/ChatWindow/MessagesList";
import UserList from "~/components/ChatWindow/RoomsList";
import usePresence from "~/components/ChatWindow/useUserCount";
import XPWindow from "~/components/XPWindow";
import { ChatLoaderType } from "~/routes/chat";

export default function ChatWindow() {
  const { room } = useLoaderData() as ChatLoaderType;
  const onlineUsers = usePresence(room);

  const StatusBar = () => (
    <>
      <p className="status-bar-field px-2">Current channel: {room}</p>
      <p className="status-bar-field pr-2">{onlineUsers?.length} member(s) online</p>
      <p className="status-bar-field pr-2">CPU Usage: 14%</p>
    </>
  );

  return (
    <XPWindow title="React Chat | XP Edition" statusBar={<StatusBar />}>
      <MessagesList />
      <ChatInput />
      <UserList users={onlineUsers} />
    </XPWindow>
  );
}
