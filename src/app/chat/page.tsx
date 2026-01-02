"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Loader2, Triangle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import React from "react";
import { ChatInput } from "@/components/ChatInput";
import { Markdown } from "@/components/Markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ChatMessage = React.memo(({ message }: { message: Message }) => {
  const isAssistant = message.role === "assistant";
  
  return (
    <div
      className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 flex-row items-start"
    >
      <div className="pt-1.5 shrink-0">
        {!isAssistant ? (
          <Triangle size={10} className="text-black/40 rotate-180" fill="currentColor" />
        ) : (
          <Triangle size={10} className="text-black" fill="currentColor" />
        )}
      </div>
      <div className="flex-1 text-sm font-light leading-relaxed text-black/80 min-w-0">
        {!isAssistant ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <Markdown content={message.content} />
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default function ChatPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const {
    initialAnalysis, 
    setInitialAnalysis, 
    analyzedImages,
    setAnalyzedImages,
    fetchHistory,
    selectedId,
    setSelectedId
  } = useAnalysisStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAnalyzedImagesRef = useRef<string>("");
  const autoScrollRef = useRef(true);

  // Fetch follow-up suggestions
  const fetchSuggestions = useCallback(async (currentMessages: Message[]) => {
    try {
      const response = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    }
  }, []);

  // Handle manual scroll to toggle auto-scroll
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      autoScrollRef.current = isAtBottom;
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset ref when selectedId changes to allow re-analysis if needed
  useEffect(() => {
    lastAnalyzedImagesRef.current = "";
  }, [selectedId]);

  // Load messages if we have a selected analysis ID
  useEffect(() => {
    if (selectedId && token && messages.length === 0) {
      // 1. Fetch messages
      fetch(`/api/chat/messages?analysisId=${selectedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          const formattedMessages = data.messages.map((m: any) => ({
            id: m.id?.toString() || Math.random().toString(36).substring(7),
            role: m.role,
            content: m.content
          }));
          setMessages(formattedMessages);
          
          // Fetch suggestions if we have messages
          if (formattedMessages.length > 0) {
            fetchSuggestions(formattedMessages);
          }
        }
      })
      .catch(err => console.error("Failed to load messages:", err));

      // 2. Fetch analysis details (images and initial analysis) if they are missing
      if (analyzedImages.length === 0) {
        fetch(`/api/history?id=${selectedId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
          if (data.analysis) {
            const { image1_url, image2_url, result } = data.analysis;
            // Prefer images from result JSON if available
            if (result && result.images && Array.isArray(result.images)) {
              setAnalyzedImages(result.images);
            } else if (image1_url && image2_url) {
              setAnalyzedImages([image1_url, image2_url]);
            } else if (image1_url) {
              setAnalyzedImages([image1_url]);
            }
            if (result && result.analysis && !initialAnalysis) {
              setInitialAnalysis(result.analysis);
            }
          }
        })
        .catch(err => console.error("Failed to load analysis details:", err));
      }
    }
  }, [selectedId, token, analyzedImages.length, initialAnalysis, setAnalyzedImages, setInitialAnalysis, messages.length, fetchSuggestions]);

  // Initialize chat or start analysis
  useEffect(() => {
    const runInitialAnalysis = async () => {
      if (initialAnalysis) {
        if (messages.length === 0) {
          setMessages([
            {
              id: "initial-analysis",
              role: "assistant",
              content: `我已经完成了您的笔迹分析。以下是我的初步发现：\n\n${initialAnalysis}\n\n关于您的笔迹，您还有什么想深入了解的吗？`,
            },
          ]);
        }
        return;
      }

      if (analyzedImages.length > 0 && messages.length === 0) {
        const imagesKey = analyzedImages.join(',');
        if (lastAnalyzedImagesRef.current === imagesKey) return;
        lastAnalyzedImagesRef.current = imagesKey;

        setIsLoading(true);
        try {
          // Prepare messages for initial analysis
          const imageContents = analyzedImages.map(url => ({
            type: "image_url" as const,
            image_url: { url }
          }));

          const apiMessages = [
            {
              role: "user",
              content: [
                { type: "text" as const, text: `请基于这 ${analyzedImages.length} 张笔迹照片进行深度心理分析。` },
                ...imageContents
              ],
            },
          ];

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages: apiMessages }),
          });

          if (!response.ok) throw new Error("Analysis failed");

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let accumulated = "";

          if (!reader) throw new Error("No reader");

          const initialId = "initial-streaming-" + Date.now();
          setMessages([{ id: initialId, role: "assistant", content: "" }]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            accumulated += chunk;
            
            setMessages((prev) => {
              const newMessages = [...prev];
              if (newMessages.length > 0) {
                newMessages[newMessages.length - 1] = {
                  ...newMessages[newMessages.length - 1],
                  content: accumulated
                };
              }
              return newMessages;
            });
          }
          
          setInitialAnalysis(accumulated);
          
          // Fetch suggestions after initial analysis
          const finalMessages: Message[] = [{ id: initialId, role: "assistant", content: accumulated }];
          fetchSuggestions(finalMessages);
          
          // Save to history if logged in
          if (user && token) {
            fetch("/api/history", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ 
                result: { 
                  analysis: accumulated,
                  images: analyzedImages 
                },
                image1_url: analyzedImages[0],
                image2_url: analyzedImages[1] || null
              }),
            })
            .then(res => res.json())
            .then(data => {
              if (data.id) {
                setSelectedId(data.id);
                // Refresh history
                fetchHistory(token);
                
                // Save the initial analysis message to the new messages table
                fetch("/api/chat/messages", {
                  method: "POST",
                  headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                  },
                  body: JSON.stringify({ 
                    analysisId: data.id,
                    role: "assistant",
                    content: accumulated
                  }),
                }).catch(err => console.error("Failed to save initial message:", err));
              }
            })
            .catch(err => console.error("Failed to save history:", err));
          }
          
        } catch (err) {
          console.error(err);
          setMessages([{ id: "error-" + Date.now(), role: "assistant", content: "抱歉，分析过程中出现了问题。请稍后再试。" }]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    runInitialAnalysis();
  }, [initialAnalysis, analyzedImages, messages.length, setInitialAnalysis, user, token, fetchHistory, setSelectedId, fetchSuggestions]);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    if (autoScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (content: string = input) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { 
      id: "user-" + Date.now(),
      role: "user", 
      content 
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSuggestions([]); // Clear suggestions when sending
    setIsLoading(true);
    autoScrollRef.current = true; // Re-enable auto-scroll on send

    // Save user message to DB if analysisId exists
    if (selectedId && token) {
      fetch("/api/chat/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          analysisId: selectedId,
          role: "user",
          content: content
        }),
      }).catch(err => console.error("Failed to save user message:", err));
    }

    try {
      // Prepare context: initial analysis and historical messages
      const apiMessages: any[] = [];

      // Add historical messages (which include the initial analysis)
      messages.forEach((m) => {
        apiMessages.push({ role: m.role, content: m.content });
      });

      // Add the new user message
      if (messages.length === 1 && analyzedImages.length > 0) {
        const imageContents = analyzedImages.map(url => ({
          type: "image_url" as const,
          image_url: { url }
        }));
        
        apiMessages.push({
          role: "user",
          content: [
            { type: "text" as const, text: content },
            ...imageContents
          ],
        });
      } else {
        apiMessages.push({ role: "user", content });
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) throw new Error("Chat failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (!reader) throw new Error("No reader");

      const assistantId = "assistant-" + Date.now();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;
        
        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: assistantContent
            };
          }
          return newMessages;
        });
      }

      // Fetch suggestions after assistant finishes
      const updatedMessages: Message[] = [
        ...messages,
        userMessage,
        { id: assistantId, role: "assistant", content: assistantContent }
      ];
      fetchSuggestions(updatedMessages);

      // Save assistant message to DB if analysisId exists
      if (selectedId && token) {
        fetch("/api/chat/messages", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            analysisId: selectedId,
            role: "assistant",
            content: assistantContent
          }),
        }).catch(err => console.error("Failed to save assistant message:", err));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { id: "error-" + Date.now(), role: "assistant", content: "抱歉，我现在遇到了一点问题。请稍后再试。" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialAnalysis && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-black/40 font-light">请先上传笔迹并进行分析</p>
          <Button onClick={() => router.push("/")} variant="outline" className="rounded-full">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center bg-white/80 backdrop-blur-md border-b border-black/[0.04]">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-black/60 hover:text-black transition-colors flex items-center gap-2 h-8 px-2 -ml-2"
        >
          <ChevronLeft size={16} />
          <span>返回分析</span>
        </Button>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium tracking-tight">有迹可循</span>
        </div>
        <div className="w-20" /> {/* Spacer */}
      </nav>

      {/* Chat Container */}
      <div className="flex-1 pt-20 pb-32 flex justify-center overflow-hidden">
        <div className="w-full max-w-3xl px-6 flex flex-col h-full">
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Analyzed Images Display */}
              {analyzedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                  {analyzedImages.map((img, i) => (
                    <div key={i} className="aspect-[4/3] relative rounded-xl overflow-hidden embossed-sm border border-black/[0.04] bg-section/30">
                      <Image 
                        src={img} 
                        alt={`Sample ${i + 1}`} 
                        fill
                        className="object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-sm text-[10px] font-medium text-black/40 uppercase tracking-wider">
                        样本 {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} className="h-4" />
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-4 items-start">
                  <div className="pt-1.5 shrink-0">
                    <Triangle size={10} className="text-black animate-pulse" fill="currentColor" />
                  </div>
                  <div className="flex-1 py-0.5">
                    <Loader2 size={14} className="animate-spin text-black/20" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        suggestions={suggestions}
      />
    </main>
  );
}
