/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, ImageOff } from 'lucide-react';
import { GalleryIcon } from './gallery-icon';
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
  onChooseFromGallery?: () => void;
}

export const InspectionDetailCard = ({ 
  title, 
  data,
  onChange,
  onImageClick,
  onChooseFromGallery,
}: InspectionDetailCardProps) => {
  const [localComments, setLocalComments] = useState(data.comments);
  const [imgError, setImgError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Check for Media Bar dragged item
    const mediaJson = e.dataTransfer.getData('application/x-orbbion-media');
    if (mediaJson) {
      try {
        const parsed = JSON.parse(mediaJson);
        if (parsed.url) {
          onChange({ image: { url: parsed.url, progress: 100 } });
          return;
        }
      } catch {
        // ignore
      }
    }

    const textUrl = e.dataTransfer.getData('text/plain');
    if (textUrl && (textUrl.startsWith('blob:') || textUrl.startsWith('http'))) {
      onChange({ image: { url: textUrl, progress: 100 } });
      return;
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E7EB] p-5 flex flex-col md:flex-row gap-6 shadow-sm">
      <div className="flex-1 flex flex-col gap-4">
        {/* Header and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-[#1E1035] text-[15px]">{title}</h3>
          
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onChange({ status: 'pass' })}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                data.status === 'pass' 
                  ? 'bg-[#5BC335] text-white shadow-xs' 
                  : 'bg-[#F4F5F8] text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              PASS
            </button>
            <button
              type="button"
              onClick={() => onChange({ status: 'fail' })}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                data.status === 'fail' 
                  ? 'bg-[#FE8E4B] text-white shadow-xs' 
                  : 'bg-[#F4F5F8] text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              FAIL
            </button>
            <button
              type="button"
              onClick={() => onChange({ status: 'weak' })}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                data.status === 'weak' 
                  ? 'bg-[#FFED00] text-[#7A7000] shadow-xs' 
                  : 'bg-[#F4F5F8] text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              WEAK
            </button>
            <button
              type="button"
              onClick={() => onChange({ status: 'na' })}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                data.status === 'na' 
                  ? 'bg-[#D3D3D3] text-[#4A4A4A] shadow-xs' 
                  : 'bg-[#F4F5F8] text-[#74768B] hover:text-[#1E1035]'
              }`}
            >
              N/A
            </button>
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField 
            label="Manufacturing year" 
            placeholder="e.g. 2025" 
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
        className={`w-full md:w-[280px] shrink-0 h-[180px] rounded-[16px] overflow-hidden border transition-all flex flex-col items-center justify-center relative group select-none ${
          isDragOver
            ? 'bg-[#F4E8FF] border-[#9723FF] ring-2 ring-[#9723FF]/40 scale-[1.02]'
            : 'border-[#E5E7EB] bg-[#F9FAFB]'
        } ${!data.image ? 'cursor-pointer' : ''}`} 
        onClick={!data.image ? onImageClick : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange({ image: null }); }} 
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white shadow-sm transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
              title="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 group">
            <img
              src="/assets/img-drop.png"
              alt="Drag and drop illustration"
              className={`w-[78px] h-auto object-contain mb-2 select-none pointer-events-none transition-transform duration-200 ${
                isDragOver ? 'scale-110' : 'group-hover:scale-105'
              }`}
            />
            <p className="text-[11.5px] font-medium text-[#74768B] leading-tight select-none">
              {isDragOver ? (
                <span className="text-[#9723FF] font-bold">Drop photo from gallery here</span>
              ) : (
                <>
                  Drag &amp; drop, or <span className="text-[#5368FF] font-semibold underline">click to upload</span>
                </>
              )}
            </p>

            {/* Choose from Gallery action */}
            {onChooseFromGallery && !isDragOver && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChooseFromGallery();
                }}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D0D4E0] hover:border-[#9723FF] hover:bg-[#FAF6FF] text-[11px] font-bold text-[#1E1035] hover:text-[#9723FF] shadow-xs transition-all cursor-pointer"
                title="Pick from photos in Media Gallery"
              >
                <GalleryIcon size={12} className="text-[#9723FF]" />
                <span>Choose from Gallery</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
