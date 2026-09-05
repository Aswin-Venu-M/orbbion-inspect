/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, ImageOff } from 'lucide-react';
import { InputField } from './input-field';

export type InspectionDetailState = {
  status: 'pass' | 'fail' | 'weak' | 'na' | null;
  year: string;
  comments: string;
  image: { url: string; progress?: number } | null;
};

interface InspectionDetailCardProps {
  title: string;
  data: InspectionDetailState;
  onChange: (data: Partial<InspectionDetailState>) => void;
  onImageClick: () => void;
}

export const InspectionDetailCard = ({ 
  title, 
  data,
  onChange,
  onImageClick
}: InspectionDetailCardProps) => {
  const [localComments, setLocalComments] = useState(data.comments);
  const [imgError, setImgError] = useState(false);

  // Sync local comments with props if it changes externally
  useEffect(() => {
    setLocalComments(data.comments);
  }, [data.comments]);

  // Reset img error if image changes
  useEffect(() => {
    setImgError(false);
  }, [data.image?.url]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalComments(val);
    onChange({ comments: val });
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 flex flex-col md:flex-row gap-6 shadow-sm">
      <div className="flex-1 flex flex-col gap-4">
        {/* Header and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-[#1E1035] text-[15px]">{title}</h3>
          
          <div className="flex items-center flex-nowrap bg-[#F4F5F8] p-[3px] rounded-full border border-[#E2E4EB] shrink-0 self-start sm:self-auto">
            <button 
              type="button"
              onClick={() => onChange({ status: 'pass' })}
              className={`px-3 sm:px-3.5 py-1 text-[11px] font-bold tracking-wide rounded-full transition-all whitespace-nowrap ${
                data.status === 'pass' ? 'bg-[#71D64B] text-white shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              PASS
            </button>
            <button 
              type="button"
              onClick={() => onChange({ status: 'fail' })}
              className={`px-3 sm:px-3.5 py-1 text-[11px] font-bold tracking-wide rounded-full transition-all whitespace-nowrap ${
                data.status === 'fail' ? 'bg-[#FE8E4B] text-white shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              FAIL
            </button>
            <button 
              type="button"
              onClick={() => onChange({ status: 'weak' })}
              className={`px-3 sm:px-3.5 py-1 text-[11px] font-bold tracking-wide rounded-full transition-all whitespace-nowrap ${
                data.status === 'weak' ? 'bg-[#FFED00] text-[#7A7000] shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              WEAK
            </button>
            <button 
              type="button"
              onClick={() => onChange({ status: 'na' })}
              className={`px-3 sm:px-3.5 py-1 text-[11px] font-bold tracking-wide rounded-full transition-all whitespace-nowrap ${
                data.status === 'na' ? 'bg-[#94A3B8] text-white shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              N/A
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 gap-4">
          <InputField 
            label="Manufacturing Year" 
            placeholder="YYYY" 
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            rightIcon={<Calendar size={18} />} 
            value={data.year || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ year: e.target.value })}
          />
          <InputField 
            label="Comments" 
            placeholder="Enter comments" 
            value={localComments || ''}
            onChange={handleCommentChange}
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
            {imgError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-50">
                <ImageOff size={24} />
                <span className="text-xs font-medium">Image failed to load</span>
              </div>
            ) : (
              <img 
                src={data.image.url} 
                alt={title} 
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)}
              />
            )}
            
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
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 group">
            <img
              src="/assets/img-drop.png"
              alt="Drag and drop illustration"
              className="w-[88px] h-auto object-contain mb-3 select-none pointer-events-none transition-transform duration-200 group-hover:scale-105"
            />
            <p className="text-xs font-medium text-[#74768B] leading-relaxed select-none">
              Drag &amp; drop, or<br/>
              <span className="text-[#5368FF] font-semibold underline cursor-pointer">click to add</span> images
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
