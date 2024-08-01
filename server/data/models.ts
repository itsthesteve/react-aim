// Same as client/src/context/messages
export interface MessageData {
  id: string;
  owner: string;
  payload: string;
}

export interface Message {
  channel: string;
  data: MessageData;
}
