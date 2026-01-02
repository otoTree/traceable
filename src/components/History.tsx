"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAnalysisStore } from "@/store/useAnalysisStore";
import { History as HistoryIcon, ChevronRight, Clock } from "lucide-react";

export function History({ onSelect }: { onSelect?: (result: any) => void }) {
  const { 
    history, 
    fetchHistory, 
    setCurrentResult,
    setInitialAnalysis,
    setAnalyzedImages,
    setSelectedId
  } = useAnalysisStore();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token && history.length === 0) {
      fetchHistory(token);
    }
  }, [token, history.length, fetchHistory]);

  if (history.length === 0) return null;

  const handleSelect = (item: any) => {
    const result = item.result;
    
    // Set initial analysis and images for the chat page
    if (result.analysis) {
      setInitialAnalysis(result.analysis);
      setAnalyzedImages(result.images || []);
    } else if (typeof result === 'string') {
      setInitialAnalysis(result);
    }
    
    setSelectedId(item.id);
    setCurrentResult(result);
    if (onSelect) onSelect(result);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-black/40 uppercase tracking-widest flex items-center gap-2">
        <HistoryIcon size={16} />
        最近的分析
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item)}
            className="text-left p-4 embossed-sm bg-white hover:shadow-soft transition-all duration-300 group flex justify-between items-center"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-black/70 line-clamp-1">
                {item.result.analysis 
                  ? item.result.analysis.substring(0, 40) 
                  : (typeof item.result === 'string' ? item.result.substring(0, 40) : '分析报告')}...
              </p>
              <div className="flex items-center gap-1.5 text-black/30">
                <Clock size={12} />
                <span className="text-[10px]">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-black/20 group-hover:text-black/40 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
