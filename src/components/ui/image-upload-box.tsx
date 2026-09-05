/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Trash2 } from 'lucide-react';

interface ImageUploadBoxProps {
  status: 'empty' | 'uploading' | 'completed';
  progress?: number;
  url?: string;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({ status, progress, url }) => {
  if (status === 'empty') {
    return (
      <div className="w-full aspect-[4/3] bg-[#F4F5F8] rounded-[20px] border border-[#E2E4EB] flex flex-col items-center justify-center cursor-pointer hover:bg-[#EDEFF4] transition-colors relative p-4 group">
        <img
          src="/assets/img-drop.png"
          alt="Drag and drop illustration"
          className="w-[90px] h-auto object-contain mb-3 select-none pointer-events-none transition-transform duration-200 group-hover:scale-105"
        />
        <p className="text-[12px] font-medium text-[#74768B] text-center leading-[1.5] select-none">
          Drag &amp; drop, or <br/>
          <span className="text-[#5368FF] font-semibold underline">click to add</span> images
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden shadow-sm group border border-[#E2E4EB]">
      <img src={url} alt="upload" className={`w-full h-full object-cover ${status === 'uploading' ? 'brightness-50' : ''}`} />
      
      <button className="absolute top-3 right-3 w-[26px] h-[26px] bg-[#FFEBEB] rounded-[8px] flex items-center justify-center text-[#FF6363] shadow-sm hover:bg-red-100 transition-colors z-20">
        <Trash2 size={14} strokeWidth={2.5} />
      </button>

      {status === 'uploading' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="flex justify-between items-end mb-2">
            <span className="text-white text-[12px] font-bold">Uploading.....</span>
            <span className="text-white text-[11px] font-bold tracking-wide">{progress} %</span>
          </div>
          <div className="h-[3px] bg-white/30 rounded-full w-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
};
