import React from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (content?: string) => void;
  isLoading: boolean;
  suggestions: string[];
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  suggestions,
}) => {
  return (
    <div className="fixed bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-black/[0.04] p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-4">
        {/* Suggestions */}
        {suggestions.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSend(suggestion)}
                className="px-4 py-2 rounded-full bg-section/50 border border-black/[0.04] text-xs font-light text-black/60 hover:bg-black hover:text-white transition-all cursor-pointer"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="输入您想问的问题..."
            className="w-full h-12 pl-6 pr-14 rounded-full bg-white embossed-sm border border-black/[0.04] focus:outline-none focus:ring-1 focus:ring-black/10 text-sm font-light"
            disabled={isLoading}
          />
          <button
            onClick={() => onSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1.5 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-20 pointer-events-auto cursor-pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
