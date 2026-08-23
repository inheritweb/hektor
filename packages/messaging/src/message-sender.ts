export interface Message {
  html: string;
  subject: string;
  text: string;
  to: string;
}

export interface MessageSender {
  send(message: Message): Promise<void>;
}
