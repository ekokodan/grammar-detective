
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { noirifyImage } from '../services/geminiService';

interface DetectiveBadgeProps {
  photo: string | null;
  onPhotoGenerated: (photo: string | null) => void;
}

export const DetectiveBadge: React.FC<DetectiveBadgeProps> = ({ photo, onPhotoGenerated }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Effect to attach the stream whenever the camera is active and the video element is ready
  useEffect(() => {
    if (isCameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraActive, stream]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 512 }, height: { ideal: 512 } } 
      });
      setStream(s);
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have granted permission.");
    }
  };

  const capturePhoto = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Constraint image size to 512x512 for better API compatibility and lower latency
        const targetSize = 512;
        canvasRef.current.width = targetSize;
        canvasRef.current.height = targetSize;
        
        // Calculate crop to center
        const video = videoRef.current;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const size = Math.min(videoWidth, videoHeight);
        const x = (videoWidth - size) / 2;
        const y = (videoHeight - size) / 2;

        context.drawImage(video, x, y, size, size, 0, 0, targetSize, targetSize);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        
        setIsProcessing(true);
        setIsCameraActive(false);
        
        // Stop all tracks to release the camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }

        try {
          const noirPhoto = await noirifyImage(dataUrl);
          onPhotoGenerated(noirPhoto);
        } catch (err) {
          console.error("Noirification failed:", err);
          onPhotoGenerated(dataUrl); // Fallback to raw photo if AI fails
        } finally {
          setIsProcessing(false);
        }
      }
    }
  }, [stream, onPhotoGenerated]);

  const resetCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    onPhotoGenerated(null);
  };

  if (photo) {
    return (
      <div className="flex flex-col items-center animate-fade-in">
        <div className="bg-stone-200 p-2 border-2 border-stone-800 shadow-xl rotate-1 max-w-[200px]">
          <img src={photo} alt="Detective Badge" className="w-full grayscale h-48 object-cover border border-stone-400" />
          <div className="mt-2 text-center">
            <p className="text-[10px] font-bold text-stone-900 uppercase tracking-tighter border-t border-stone-400 pt-1">
              BUREAU DES ENQUÊTES
            </p>
            <p className="text-[8px] text-stone-600 font-mono italic">Validated by Inspector</p>
          </div>
        </div>
        <button 
          onClick={resetCamera} 
          className="mt-4 text-xs text-stone-500 hover:text-amber-500 underline uppercase font-mono"
        >
          Retake ID Photo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {isCameraActive ? (
        <div className="relative group">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-48 h-48 object-cover rounded-lg border-2 border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.3)] grayscale transition-all bg-black"
          />
          <button 
            onClick={capturePhoto}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-600 text-stone-900 px-4 py-1 rounded font-bold text-xs uppercase tracking-widest hover:bg-amber-500 shadow-lg z-10"
          >
            Snap
          </button>
        </div>
      ) : isProcessing ? (
        <div className="w-48 h-48 flex flex-col items-center justify-center bg-stone-900 rounded-lg border-2 border-stone-800 animate-pulse">
          <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent animate-spin rounded-full mb-2"></div>
          <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">Noir-ifying...</span>
        </div>
      ) : (
        <button 
          onClick={startCamera}
          className="w-48 h-48 flex flex-col items-center justify-center bg-stone-900/50 rounded-lg border-2 border-dashed border-stone-700 hover:border-amber-600 hover:bg-stone-800/80 transition-all group"
        >
          <div className="text-amber-600 mb-2 opacity-50 group-hover:opacity-100 transition-opacity">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-[10px] text-stone-600 group-hover:text-amber-600 font-mono uppercase tracking-widest text-center px-4">
            Create Detective ID Card
          </span>
        </button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
