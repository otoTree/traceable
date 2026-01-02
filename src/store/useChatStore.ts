import { create } from "zustand";
import { ChatState, Message } from "@/types/ai";

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substring(7),
          createdAt: Date.now(),
        },
      ],
    })),
  setMessages: (messages) => set({ messages }),
  setLoading: (isLoading) => set({ isLoading }),
  updateLastMessage: (content: string) =>
    set((state) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.role === "assistant") {
        return {
          messages: [
            ...state.messages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + content },
          ],
        };
      }
      return state;
    }),
  clearMessages: () => set({ messages: [] }),
}));
