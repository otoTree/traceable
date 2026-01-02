"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { History } from "./History";
import { Button } from "./ui/button";
import { History as HistoryIcon } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAnalysisStore } from "@/store/useAnalysisStore";

import { useRouter } from "next/navigation";

export function AppSidebar({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setCurrentResult = useAnalysisStore((state) => state.setCurrentResult);

  if (!user) return null;

  const handleSelect = (result: any) => {
    setCurrentResult(result);
    setOpen(false);
    router.push("/chat");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/80 backdrop-blur-md border border-black/[0.04] shadow-sm hover:bg-white transition-all"
          >
            <HistoryIcon size={20} className="text-black/60" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white/95 backdrop-blur-xl border-r border-black/[0.04] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-black/[0.04]">
          <SheetTitle className="font-serif font-light text-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <span className="text-white text-xs font-serif italic">T</span>
            </div>
            分析历史
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <History onSelect={handleSelect} />
        </div>
        <div className="p-6 border-t border-black/[0.04] bg-section/30">
          <p className="text-[10px] text-black/30 font-light uppercase tracking-widest text-center">
            Traceable AI • 笔迹心理分析
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
