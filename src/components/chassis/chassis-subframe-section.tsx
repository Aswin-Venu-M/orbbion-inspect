"use client";

import React, { useRef } from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { Trash2 } from 'lucide-react';
import { CustomHeadlineItem } from '@/lib/inspection-types';
import { HeadingCard } from '@/components/ui/heading-card';
import { AddHeadlineButton } from '@/components/ui/add-headline-button';

export type SubframePartStatus = 'repaired' | 'damaged' | 'checked' | 'unchecked';

export interface PartDef {
  id: number;
  label: string;
  cx: number;
  cy: number;
  bx: number;
  by: number;
}

export const SUBFRAME_PARTS: PartDef[] = [
  { id: 1, label: 'Core support', cx: 20, cy: 66, bx: 15, by: 77 },
  { id: 2, label: 'Frame rail', cx: 33, cy: 59, bx: 25, by: 42 },
  { id: 3, label: 'Wheel house', cx: 24, cy: 56, bx: 12, by: 55 },
  { id: 4, label: 'Right fender apron', cx: 20, cy: 54, bx: 15, by: 46 },
  { id: 5, label: 'Shock tower/shock mount', cx: 28, cy: 47, bx: 30, by: 37 },
  { id: 6, label: 'Radiator side support (side baffle)', cx: 40, cy: 67, bx: 37, by: 78 },
  { id: 7, label: 'Left fender apron', cx: 48, cy: 56, bx: 48, by: 78 },
  { id: 8, label: 'Front body hinge pilar', cx: 58, cy: 65, bx: 62, by: 76 },
  { id: 9, label: 'Front floor board', cx: 65, cy: 63, bx: 72, by: 73 },
  { id: 10, label: 'Left door sil', cx: 68, cy: 67, bx: 68, by: 76 },
  { id: 11, label: 'Center pilar post(B pilar)', cx: 72, cy: 56, bx: 78, by: 37 },
  { id: 12, label: 'Mid floor board', cx: 77, cy: 62, bx: 77, by: 69 },
  { id: 13, label: 'Body quarter panel', cx: 80, cy: 51, bx: 83, by: 52 },
  { id: 14, label: 'C pilar', cx: 76, cy: 44, bx: 84, by: 41 },
  { id: 15, label: 'Seat frame', cx: 67, cy: 37, bx: 66, by: 27 },
  { id: 16, label: 'Rear floor panel', cx: 73, cy: 45, bx: 74, by: 30 },
  { id: 17, label: 'Left A pilar', cx: 59, cy: 35, bx: 56, by: 25 },
  { id: 18, label: 'Roof panel', cx: 48, cy: 30, bx: 44, by: 25 },
  { id: 19, label: 'Left door sil', cx: 51, cy: 46, bx: 50, by: 26 },
  { id: 20, label: 'Right A pilar', cx: 40, cy: 42, bx: 36, by: 32 },
];

const STATUS_COLORS: Record<SubframePartStatus, string> = {
  repaired: '#4A72FF',
  damaged: '#F54752',
  checked: '#000000',
  unchecked: '#000000',
};

interface ChassisSubframeSectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  partStatuses?: Record<number, SubframePartStatus>;
  onPartStatusesChange?: (statuses: Record<number, SubframePartStatus>) => void;
  chassisImages?: string[];
  onChassisImagesChange?: (images: string[]) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
}

export const ChassisSubframeSection: React.FC<ChassisSubframeSectionProps> = ({
  initialComments = '',
  onCommentsChange,
  partStatuses = {},
  onPartStatusesChange,
  chassisImages = [],
  onChassisImagesChange,
  customHeadlines = [],
  onCustomHeadlinesChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultHeadlines = customHeadlines.length > 0 ? customHeadlines : [
    { id: 'default-chassis', title: 'Chassis Details', comments: '', imageUrl: undefined }
  ];

  const handlePartClick = (id: number) => {
    const current = partStatuses[id] || 'unchecked';
    let nextStatus: SubframePartStatus = 'checked';
    if (current === 'unchecked') nextStatus = 'checked';
    else if (current === 'checked') nextStatus = 'repaired';
    else if (current === 'repaired') nextStatus = 'damaged';
    else if (current === 'damaged') nextStatus = 'unchecked';
    
    if (onPartStatusesChange) {
      onPartStatusesChange({ ...partStatuses, [id]: nextStatus });
    }
  };

  const setAllStatus = (status: SubframePartStatus) => {
    const newStatuses: Record<number, SubframePartStatus> = {};
    SUBFRAME_PARTS.forEach(p => {
      newStatuses[p.id] = status;
    });
    if (onPartStatusesChange) {
      onPartStatusesChange(newStatuses);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onCommentsChange) {
      onCommentsChange(val);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
    if (onChassisImagesChange) {
      onChassisImagesChange([...chassisImages, ...newUrls]);
    }
    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    if (onChassisImagesChange) {
      const newImages = [...chassisImages];
      newImages.splice(index, 1);
      onChassisImagesChange(newImages);
    }
  };

  const addHeadline = () => {
    if (onCustomHeadlinesChange) {
      onCustomHeadlinesChange([...defaultHeadlines, { id: Math.random().toString(36).substring(7), title: '', comments: '' }]);
    }
  };

  const removeHeadline = (id: string) => {
    if (onCustomHeadlinesChange) {
      onCustomHeadlinesChange(defaultHeadlines.filter(h => h.id !== id));
    }
  };

  const updateHeadline = (id: string, updates: Partial<CustomHeadlineItem>) => {
    if (onCustomHeadlinesChange) {
      onCustomHeadlinesChange(defaultHeadlines.map(h => h.id === id ? { ...h, ...updates } : h));
    }
  };

  // Group parts for the 3-column list
  const col1 = SUBFRAME_PARTS.slice(0, 7);
  const col2 = SUBFRAME_PARTS.slice(7, 14);
  const col3 = SUBFRAME_PARTS.slice(14, 20);

  return (
    <div id="section-chassis-subframe" className="flex flex-col gap-2 w-full scroll-mt-6">
      <ReusableSection title="Chassis & Subframe">
        <div className="flex flex-col gap-8 items-center bg-white rounded-[20px] p-6 sm:p-8">
          
          {/* Legend / Global Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setAllStatus('repaired')}
              className="px-6 py-2 bg-[#4A72FF] text-white font-semibold text-sm rounded-full transition-transform hover:scale-105 active:scale-95"
            >
              REPAIRED
            </button>
            <button 
              onClick={() => setAllStatus('damaged')}
              className="px-6 py-2 bg-[#F54752] text-white font-semibold text-sm rounded-full transition-transform hover:scale-105 active:scale-95"
            >
              DAMAGED
            </button>
            <button 
              onClick={() => setAllStatus('checked')}
              className="px-6 py-2 bg-[#000000] text-white font-semibold text-sm rounded-full transition-transform hover:scale-105 active:scale-95"
            >
              CHECKED
            </button>
          </div>

          {/* Visualizer Area */}
          <div className="relative w-full max-w-[800px] aspect-[16/10] mt-4 select-none">
            {/* SVG lines */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ overflow: 'visible' }}
            >
              {SUBFRAME_PARTS.map((part) => (
                <line 
                  key={`line-${part.id}`}
                  x1={`${part.bx}%`} 
                  y1={`${part.by}%`} 
                  x2={`${part.cx}%`} 
                  y2={`${part.cy}%`} 
                  stroke="#A0A4AB" 
                  strokeWidth="1.5" 
                />
              ))}
              {SUBFRAME_PARTS.map((part) => (
                <circle
                  key={`dot-${part.id}`}
                  cx={`${part.cx}%`}
                  cy={`${part.cy}%`}
                  r="3"
                  fill="#A0A4AB"
                />
              ))}
            </svg>

            {/* Base Image */}
            <img 
              src="/assets/car-perspective.png" 
              alt="Chassis Subframe Perspective" 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-0 opacity-90"
            />

            {/* Interactive Bubbles */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              {SUBFRAME_PARTS.map((part) => {
                const status = partStatuses[part.id] || 'unchecked';
                const isUnchecked = status === 'unchecked';
                const bgColor = STATUS_COLORS[status];
                return (
                  <button
                    key={`bubble-${part.id}`}
                    onClick={() => handlePartClick(part.id)}
                    className="absolute flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold shadow-md transition-all pointer-events-auto hover:scale-110 active:scale-95"
                    style={{ 
                      top: `${part.by}%`, 
                      left: `${part.bx}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: isUnchecked ? '#000000' : bgColor,
                      border: isUnchecked ? '2px solid white' : 'none'
                    }}
                  >
                    {part.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Column List */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-8 mt-6">
            <div className="flex flex-col gap-3">
              {col1.map((p) => (
                <div key={p.id} className="flex gap-2 text-[14px] font-semibold text-[#1E1035]">
                  <span className="w-5 text-right">{p.id}.</span>
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {col2.map((p) => (
                <div key={p.id} className="flex gap-2 text-[14px] font-semibold text-[#1E1035]">
                  <span className="w-5 text-right">{p.id}.</span>
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {col3.map((p) => (
                <div key={p.id} className="flex gap-2 text-[14px] font-semibold text-[#1E1035]">
                  <span className="w-5 text-right">{p.id}.</span>
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex flex-col gap-2 mt-6">
          <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
          <input 
            type="text" 
            value={initialComments}
            onChange={handleCommentChange}
            placeholder="Enter comments" 
            className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-1 focus:ring-[#1E1035]/20 transition-all" 
          />
        </div>

        {/* General Photos Image Upload Box */}
        <div className="flex flex-wrap gap-4 items-center mt-6">
          {chassisImages.map((imgUrl, i) => (
            <div key={i} className="w-[180px] relative group">
              <ImageUploadBox status="completed" url={imgUrl} />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className="w-[180px]" onClick={() => fileInputRef.current?.click()}>
            <ImageUploadBox status="empty" />
          </div>
        </div>
      </ReusableSection>
      
      {/* Dynamically added headlines */}
      {defaultHeadlines.map((headline) => (
        <HeadingCard
          key={headline.id}
          initialTitle={headline.title}
          initialComments={headline.comments}
          initialImageUrl={headline.imageUrl}
          isRemovable={defaultHeadlines.length > 1}
          onRemove={() => removeHeadline(headline.id)}
          onChangeTitle={(title) => updateHeadline(headline.id, { title })}
          onChangeComments={(comments) => updateHeadline(headline.id, { comments })}
          onChangeImage={(imageUrl) => updateHeadline(headline.id, { imageUrl: imageUrl || undefined })}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Chassis Headline" />
    </div>
  );
};
