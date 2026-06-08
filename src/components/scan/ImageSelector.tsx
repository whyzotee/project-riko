import React from "react";
import { Camera, Upload } from "lucide-react";

interface ImageSelectorProps {
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  cameraInputRef,
  fileInputRef,
  onCapture,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 flex-1">
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        className="group relative overflow-hidden bg-card rounded-2xl border border-border p-10 flex flex-col items-center justify-center text-foreground tap-effect shadow-2xl h-64"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] -mr-16 -mt-16"></div>
        <Camera className="w-16 h-16 mb-6 group-hover:scale-110 transition-transform duration-500 text-secondary" />
        <span className="text-2xl font-black tracking-tighter italic">
          Snap Photo
        </span>
        <p className="text-muted-foreground text-[10px] font-black tracking-[0.3em] uppercase mt-2">
          Use Camera
        </p>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onCapture}
        />
      </button>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group bg-muted/50 border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-muted-foreground tap-effect hover:bg-muted hover:border-primary/50 transition-all h-48"
      >
        <Upload className="w-10 h-10 mb-4 group-hover:-translate-y-2 transition-transform duration-500 text-secondary" />
        <span className="text-lg font-black tracking-tight text-muted-foreground italic">
          Choose from Library
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onCapture}
        />
      </button>
    </div>
  );
};
