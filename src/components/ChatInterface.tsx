"use client";

import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, User, Bot, Trash2 } from "lucide-react";
import { Markdown } from "@/components/Markdown";

interface ChatInterfaceProps {
  analysisId?: number | null;
}

export function ChatInterface({ analysisId }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const { messages, addMessage, updateLastMessage, setMessages, isLoading, setLoading, clearMessages } = useChatStore();
  const { token } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from DB if analysisId is provided
  useEffect(() => {
    if (analysisId && token) {
      fetch(`/api/chat/messages?analysisId=${analysisId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.messages) {
          setMessages(data.messages.map((m: any) => ({
            id: m.id.toString(),
            role: m.role,
            content: m.content,
            createdAt: new Date(m.created_at).getTime()
          })));
        }
      })
      .catch(err => console.error("Failed to load messages:", err));
    }
  }, [analysisId, token, setMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input;
    const userMessage = { role: "user" as const, content: userMessageContent };
    addMessage(userMessage);
    setInput("");
    setLoading(true);

    // Save user message to DB
    if (analysisId && token) {
      fetch("/api/chat/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          analysisId,
          role: "user",
          content: userMessageContent
        }),
      }).catch(err => console.error("Failed to save user message:", err));
    }

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

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error("No reader available");

      addMessage({ role: "assistant", content: "" });
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        updateLastMessage(chunk);
      }

      // Save assistant message to DB
      if (analysisId && token) {
        fetch("/api/chat/messages", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            analysisId,
            role: "assistant",
            content: assistantContent
          }),
        }).catch(err => console.error("Failed to save assistant message:", err));
      }
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
                {message.role === "user" ? (
                  typeof message.content === "string" ? (
                    message.content
                  ) : (
                    <div className="space-y-2">
                      {message.content.map((part, i) => {
                        if (part.type === "text") return <p key={i}>{part.text}</p>;
                        if (part.type === "image_url") return (
                          <img key={i} src={part.image_url.url} alt="User" className="max-w-full rounded-lg" />
                        );
                        return null;
                      })}
                    </div>
                  )
                ) : (
                  <Markdown content={typeof message.content === "string" ? message.content : ""} />
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
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
