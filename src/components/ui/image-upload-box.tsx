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
      <div className="w-full aspect-[4/3] bg-[#F4F5F8] rounded-[16px] border border-[#E2E4EB] flex flex-col items-center justify-center cursor-pointer hover:bg-[#EDEFF4] transition-colors relative">
        <div className="relative mb-4 flex items-center justify-center h-[54px] w-full">
           {/* Card -2 (Far Left) */}
           <div className="absolute w-[44px] h-[40px] bg-white/40 rounded-xl shadow-sm -ml-[56px] border border-white/50"></div>
           {/* Card -1 (Left) */}
           <div className="absolute w-[52px] h-[46px] bg-white/70 rounded-xl shadow-sm -ml-[28px] border border-white/80"></div>
           {/* Card +2 (Far Right) */}
           <div className="absolute w-[44px] h-[40px] bg-white/40 rounded-xl shadow-sm ml-[56px] border border-white/50"></div>
           {/* Card +1 (Right) */}
           <div className="absolute w-[52px] h-[46px] bg-white/70 rounded-xl shadow-sm ml-[28px] border border-white/80"></div>
           
           {/* Center Card */}
           <div className="absolute w-[64px] h-[54px] bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-50 flex flex-col items-center justify-start p-1.5 z-10">
             <div className="w-full flex-1 bg-[#F4F5F8] rounded-lg overflow-hidden relative mb-1">
               <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#CFD2DF] rounded-full"></div>
               <svg className="absolute bottom-0 w-full h-[18px] text-[#CFD2DF]" viewBox="0 0 40 18" preserveAspectRatio="none" fill="currentColor">
                 <path d="M0,18 L12,6 L20,13 L32,0 L40,18 Z" />
               </svg>
             </div>
             <div className="flex items-center justify-center gap-1 w-full pb-0.5">
               <div className="w-1.5 h-0.5 bg-[#E2E4EB] rounded-full"></div>
               <div className="w-1.5 h-0.5 bg-[#E2E4EB] rounded-full"></div>
               <div className="w-1.5 h-0.5 bg-[#E2E4EB] rounded-full"></div>
             </div>
           </div>
        </div>
        <span className="text-[12px] font-medium text-[#74768B] text-center px-4 leading-[1.5]">
          Drag & drop, or <br/><span className="text-[#5368FF] font-bold underline">click to add</span> images
        </span>
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
