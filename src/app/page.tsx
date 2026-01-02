"use client";

import { HandwritingAnalyzer } from "@/components/HandwritingAnalyzer";
import { AuthDialog } from "@/components/AuthDialog";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user, logout } = useAuthStore();

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-black/[0.04]">
        <div className="flex items-center gap-4">
          <AppSidebar trigger={
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
            >
              <span className="text-white text-xs font-serif italic">T</span>
            </Button>
          } />
          <span className="text-sm font-medium tracking-tight">Traceable AI</span>
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-section/50 border border-black/[0.04]">
              <UserIcon size={14} className="text-black/40" />
              <span className="text-xs font-light text-black/60">{user.username}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-black/40 hover:text-black transition-colors flex items-center gap-2 h-8 px-3"
            >
              <LogOut size={14} />
              <span className="text-xs">退出</span>
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-serif font-light tracking-tight text-black animate-in fade-in slide-in-from-top-4 duration-1000">
            笔迹心理分析
          </h1>
          <p className="text-black/50 font-light text-lg max-w-xl mx-auto animate-in fade-in slide-in-from-top-6 duration-1000 delay-200">
            上传您的笔迹照片（最多 10 张），让 AI 为您解读隐藏在文字背后的性格密码与心理状态。
          </p>
          <div className="h-px w-32 bg-black/5 mx-auto animate-in fade-in duration-1000 delay-500" />
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 px-6 flex justify-center">
        <div className="w-full max-w-4xl">
          {user ? <HandwritingAnalyzer /> : <AuthDialog />}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-black/[0.04]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <span className="text-white text-xs font-serif italic">T</span>
            </div>
            <span className="text-sm font-medium tracking-tight">Traceable AI</span>
          </div>
          <p className="text-xs text-black/40 font-light">
            © 2024 Traceable AI. 基于先进的视觉大模型提供分析。
          </p>
        </div>
      </footer>
    </main>
  );
}
