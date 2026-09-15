/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { ImageOff, ZoomIn } from 'lucide-react';

interface ImageUploadBoxProps {
  status: 'empty' | 'uploading' | 'completed';
  progress?: number;
  url?: string;
  isDragOver?: boolean;
  onPreview?: () => void;
  onClick?: () => void;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  status,
  progress,
  url,
  isDragOver = false,
  onPreview,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if url changes
  React.useEffect(() => {
    setHasError(false);
  }, [url]);

  if (status === 'empty') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        className={`w-full aspect-[4/3] rounded-[20px] border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 relative p-4 group select-none ${
          isDragOver
            ? 'bg-[#EBF0FF] border-[#5368FF] ring-2 ring-[#5368FF]/40 scale-[1.02]'
            : 'bg-[#F4F5F8] border-[#E2E4EB] hover:bg-[#EDEFF4] hover:border-[#D0D4E0]'
        }`}
      >
        <img
          src="/assets/img-drop.png"
          alt="Drag and drop illustration"
          className={`w-[88px] h-auto object-contain mb-3 select-none pointer-events-none transition-transform duration-200 ${
            isDragOver ? 'scale-110' : 'group-hover:scale-105'
          }`}
        />
        <p className="text-[12px] font-medium text-[#74768B] text-center leading-[1.5] pointer-events-none">
          {isDragOver ? (
            <span className="text-[#5368FF] font-bold">Drop image here</span>
          ) : (
            <>
              Drag &amp; drop, or <br />
              <span className="text-[#5368FF] font-semibold underline">click to add</span> images
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden shadow-sm group border border-[#E2E4EB] bg-slate-50"
      onClick={onPreview}
    >
      {hasError ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 text-slate-400 bg-slate-100/80">
          <ImageOff size={24} className="text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-500 text-center leading-tight">
            Image unavailable
          </span>
        </div>
      ) : (
        <>
          <img
            src={url}
            alt="upload"
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              status === 'uploading' ? 'brightness-50' : 'group-hover:scale-105 cursor-pointer'
            }`}
          />
          {status === 'completed' && onPreview && (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none cursor-pointer">
              <div className="p-2 rounded-full bg-black/60 text-white shadow-sm">
                <ZoomIn size={18} />
              </div>
            </div>
          )}
        </>
      )}

      {status === 'uploading' && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-white text-[11px] font-bold">Uploading...</span>
            <span className="text-white text-[10px] font-bold tracking-wide">{progress ?? 0}%</span>
          </div>
          <div className="h-[3px] bg-white/30 rounded-full w-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              style={{ width: `${progress ?? 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
