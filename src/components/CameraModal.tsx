"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Camera, X, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("无法访问摄像头，请确保已授予权限并使用 HTTPS。");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }
    return () => stopCamera();
  }, [isOpen, startCamera, stopCamera]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      // Convert data URL to File
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `camera-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);
          onClose();
        });
    }
  };

  const retake = () => {
    setCapturedImage(null);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-[90vh] p-0 flex flex-col bg-black border-none rounded-t-[2rem] overflow-hidden">
        <SheetHeader className="p-6 pb-2 text-white">
          <SheetTitle className="text-white font-light">拍摄笔迹照片</SheetTitle>
          <SheetDescription className="text-white/40 font-light">
            请确保字迹清晰，光线充足
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 relative bg-zinc-900 overflow-hidden flex items-center justify-center">
          {!capturedImage ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!isCameraReady && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <RefreshCw className="w-8 h-8 text-white/50 animate-spin" />
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-white/60 text-sm mb-4">{error}</p>
                  <Button variant="outline" onClick={startCamera} className="text-white border-white/20 hover:bg-white/10">
                    重试
                  </Button>
                </div>
              )}
            </>
          ) : (
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-8 pb-12 bg-black flex items-center justify-around">
          {!capturedImage ? (
            <>
              <button
                onClick={onClose}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <button
                onClick={capturePhoto}
                disabled={!isCameraReady}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 disabled:opacity-50"
              >
                <div className="w-full h-full rounded-full bg-white active:scale-90 transition-transform" />
              </button>
              <div className="w-12 h-12" /> {/* Spacer */}
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={retake}
                className="text-white/60 hover:text-white hover:bg-white/10 gap-2"
              >
                <RefreshCw size={18} />
                重拍
              </Button>
              <Button
                onClick={handleConfirm}
                className="bg-white text-black hover:bg-white/90 rounded-full px-8 gap-2"
              >
                <Check size={18} />
                确认使用
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
