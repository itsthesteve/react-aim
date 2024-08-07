export class MessageError extends Error {
  reason: string;

  constructor(reason: string) {
    super(`Error sending message: ${reason}`);
    this.name = "MessageError";
    this.reason = reason;
  }
}
