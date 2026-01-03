"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { useAnalysisStore } from "@/store/useAnalysisStore";

export function HandwritingAnalyzer() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const { 
    setAnalyzedImages,
    setInitialAnalysis,
    setSelectedId,
    reset 
  } = useAnalysisStore();
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const token = useAuthStore((state) => state.token);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 10) {
      setError("最多只能上传 10 张笔迹照片。");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...newImageUrls]);
    } catch (err) {
      setError("图片上传失败，请重试。");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = async () => {
    if (images.length === 0) {
      setError("请至少上传一张笔迹照片以进行分析。");
      return;
    }

    // Reset previous analysis state before starting new one
    reset();
    setAnalyzedImages(images);
    router.push("/chat");
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      {/* Upload & Controls */}
      <div className="space-y-12">
        {/* Upload Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-black/[0.04]">
              <Image
                src={image}
                alt={`Sample ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm text-[10px] text-white font-medium uppercase tracking-wider">
                #{index + 1}
              </div>
            </div>
          ))}

          {images.length < 10 && (
            <label className={cn(
              "relative aspect-square rounded-xl border-2 border-dashed border-black/5 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer hover:border-black/10 bg-section/30 hover:bg-section/50",
              isUploading && "opacity-50 cursor-wait"
            )}>
              <div className="p-3 rounded-full bg-white shadow-sm border border-black/[0.04]">
                <Upload size={20} className="text-black/60" />
              </div>
              <p className="mt-2 text-[10px] font-medium text-black/40 uppercase tracking-widest">添加照片</p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={startAnalysis}
            disabled={images.length === 0 || isUploading}
            className="h-14 px-10 rounded-full bg-black text-white hover:bg-black/90 transition-all duration-300 flex items-center gap-3 text-lg font-light shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <Sparkles size={20} />
            开始心理分析
          </Button>
          <p className="text-xs text-black/30 font-light">
            已添加 {images.length} / 10 张照片
          </p>
        </div>

        {error && (
          <p className="text-center text-red-500 text-sm font-light animate-in fade-in slide-in-from-top-2">{error}</p>
        )}
      </div>
    </div>
  );
}
