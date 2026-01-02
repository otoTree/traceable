import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AnalysisResult {
  analysis: string;
  images: string[];
}

interface AnalysisState {
  currentResult: AnalysisResult | null;
  initialAnalysis: string | null;
  analyzedImages: string[];
  history: any[];
  selectedId: number | null;
  setCurrentResult: (result: AnalysisResult | null) => void;
  setInitialAnalysis: (analysis: string | null) => void;
  setAnalyzedImages: (images: string[]) => void;
  setHistory: (history: any[]) => void;
  setSelectedId: (id: number | null) => void;
  fetchHistory: (token: string) => Promise<void>;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      currentResult: null,
      initialAnalysis: null,
      analyzedImages: [],
      history: [],
      selectedId: null,
      setCurrentResult: (result) => set({ currentResult: result }),
      setInitialAnalysis: (analysis) => set({ initialAnalysis: analysis }),
      setAnalyzedImages: (images) => set({ analyzedImages: images }),
      setHistory: (history) => set({ history }),
      setSelectedId: (id) => set({ selectedId: id }),
      fetchHistory: async (token: string) => {
        try {
          const response = await fetch("/api/history", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.history) {
            set({ history: data.history });
          }
        } catch (error) {
          console.error("Failed to fetch history:", error);
        }
      },
      reset: () => set({ currentResult: null, initialAnalysis: null, analyzedImages: [], selectedId: null }),
    }),
    {
      name: "analysis-storage",
      partialize: (state) => ({ selectedId: state.selectedId }),
    }
  )
);
