"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, User, Lock, ArrowRight } from "lucide-react";

export function AuthDialog() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Authentication failed");

      setUser(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md p-8 embossed bg-white border-none space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-section mx-auto flex items-center justify-center embossed-sm mb-4">
            <User className="text-black/40" size={24} />
          </div>
          <h2 className="text-2xl font-serif font-light">
            {isLogin ? "欢迎回来" : "创建账户"}
          </h2>
          <p className="text-black/40 text-sm font-light">
            {isLogin ? "登录以查看您的分析历史" : "加入我们，开启笔迹探索之旅"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" size={18} />
              <Input
                placeholder="用户名"
                className="pl-10 h-12 bg-section/30 border-none focus-visible:ring-1 focus-visible:ring-black/10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20" size={18} />
              <Input
                type="password"
                placeholder="密码"
                className="pl-10 h-12 bg-section/30 border-none focus-visible:ring-1 focus-visible:ring-black/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-light">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-black text-white hover:bg-black/90 rounded-xl flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                {isLogin ? "登录" : "注册"}
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-black/40 hover:text-black transition-colors font-light"
          >
            {isLogin ? "还没有账号？立即注册" : "已有账号？直接登录"}
          </button>
        </div>
      </Card>
    </div>
  );
}
