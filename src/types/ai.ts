export type MessageRole = "user" | "assistant" | "system";

export type MessageContentPart = 
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } };

export type MessageContent = string | MessageContentPart[];

export interface Message {
  id: string;
  role: MessageRole;
  content: MessageContent;
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
