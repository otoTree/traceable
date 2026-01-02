"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, User, Bot, Trash2 } from "lucide-react";

export function ChatInterface() {
  const [input, setInput] = useState("");
  const { messages, addMessage, isLoading, setLoading, clearMessages } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    addMessage(userMessage);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      addMessage({ role: "assistant", content: data.content });
    } catch (error) {
      console.error("Chat Error:", error);
      addMessage({ role: "assistant", content: "Error: Could not connect to the AI service." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto embossed overflow-hidden bg-white">
      {/* Header */}
      <div className="p-4 border-b border-black/[0.04] flex justify-between items-center bg-section/30">
        <h2 className="text-lg font-serif font-light flex items-center gap-2">
          <Bot size={20} className="text-black/70" />
          Traceable AI
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearMessages}
          className="text-black/40 hover:text-destructive transition-colors"
        >
          <Trash2 size={18} />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-black/40 space-y-2 mt-20">
              <Bot size={48} strokeWidth={1} />
              <p className="font-light">How can I help you today?</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 max-w-[85%]",
                message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-black/[0.04]",
                  message.role === "user" ? "bg-black text-white" : "bg-white text-black embossed-sm"
                )}
              >
                {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-black text-white"
                    : "bg-section/50 text-black/80 border border-black/[0.02]"
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%] animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white border border-black/[0.04] flex items-center justify-center embossed-sm">
                <Bot size={16} />
              </div>
              <div className="p-3 rounded-2xl bg-section/30 text-black/40 border border-black/[0.02] text-sm">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-black/[0.04] bg-white">
        <div className="relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="pr-12 py-6 bg-section/20 border-black/[0.04] focus-visible:ring-black/[0.08] rounded-xl font-light"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="absolute right-2 h-8 w-8 bg-black hover:bg-black/80 text-white rounded-lg transition-all active:scale-95"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
}
