export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  addMessage: (message: Omit<Message, "id" | "createdAt">) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (isLoading: boolean) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
}
