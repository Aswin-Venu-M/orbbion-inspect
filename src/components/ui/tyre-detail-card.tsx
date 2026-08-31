import React, { useState } from 'react';
import { Calendar, Trash2, Image as ImageIcon } from 'lucide-react';
import { InputField } from './input-field';

export type TyreDetailState = {
  status: 'pass' | 'fail' | 'weak' | 'na' | null;
  year: string;
  comments: string;
  image: { url: string; progress?: number } | null;
};

interface TyreDetailCardProps {
  title: string;
  data: TyreDetailState;
  onChange: (data: Partial<TyreDetailState>) => void;
  onImageClick: () => void;
}

export const TyreDetailCard = ({ 
  title, 
  data,
  onChange,
  onImageClick
}: TyreDetailCardProps) => {
  return (
    <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 flex flex-col md:flex-row gap-6 shadow-sm">
      <div className="flex-1 flex flex-col gap-4">
        {/* Header and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="font-bold text-[#1E1035] text-sm w-[130px] shrink-0">{title}</h3>
          
          <div className="flex bg-[#F4F5F8] rounded-full p-1 border border-[#E5E7EB] w-fit">
            <button 
              onClick={() => onChange({ status: 'pass' })}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${data.status === 'pass' ? 'bg-[#7FD159] text-white shadow-sm' : 'text-[#A0A4AB] hover:bg-white'}`}
            >
              PASS
            </button>
            <button 
              onClick={() => onChange({ status: 'fail' })}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${data.status === 'fail' ? 'bg-[#FE8E4B] text-white shadow-sm' : 'text-[#A0A4AB] hover:bg-white'}`}
            >
              FAIL
            </button>
            <button 
              onClick={() => onChange({ status: 'weak' })}
              className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${data.status === 'weak' ? 'bg-[#FFED00] text-[#7A7000] shadow-sm' : 'text-[#A0A4AB] hover:bg-white'}`}
            >
              WEAK
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-4">
          <InputField 
            label="Manufacturing Year" 
            placeholder="YYYY" 
            rightIcon={<Calendar size={18} />} 
            value={data.year}
            onChange={(e: any) => onChange({ year: e.target.value })}
          />
          <InputField 
            label="Comments" 
            placeholder="Enter comments" 
            value={data.comments}
            onChange={(e: any) => onChange({ comments: e.target.value })}
          />
        </div>
      </div>

      {/* Image Upload Area */}
      <div 
        className="w-full md:w-[280px] shrink-0 h-[180px] rounded-[16px] overflow-hidden border border-[#E5E7EB] bg-[#F9FAFB] flex flex-col items-center justify-center relative cursor-pointer group" 
        onClick={!data.image ? onImageClick : undefined}
      >
        {data.image ? (
          <>
            <img src={data.image.url} alt={title} className="w-full h-full object-cover" />
            
            {data.image.progress !== undefined && data.image.progress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between text-white text-xs font-semibold mb-1">
                  <span>Uploading.....</span>
                  <span>{data.image.progress}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: `${data.image.progress}%` }}></div>
                </div>
              </div>
            )}
            
            <button 
              onClick={(e) => { e.stopPropagation(); onChange({ image: null }); }} 
              className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="w-[88px] h-[72px] bg-white rounded-[16px] shadow-sm border border-[#E5E7EB] flex items-center justify-center mb-3 text-[#E5E7EB]">
              {/* Abstract image icon similar to the user image */}
              <svg width="42" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <p className="text-xs font-medium text-[#A0A4AB]">
              Drag & drop, or<br/>
              <span className="text-[#3354FA] hover:underline cursor-pointer">click to add</span> images
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
