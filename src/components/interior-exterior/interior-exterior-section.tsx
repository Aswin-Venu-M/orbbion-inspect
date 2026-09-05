"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { StatusBadge } from '@/components/ui/status-badge';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { GeneralCommentsCard } from '@/components/ui/general-comments-card';
import { HeadingCard } from '@/components/ui/heading-card';
import { AddHeadlineButton } from '@/components/ui/add-headline-button';
import { Trash2 } from 'lucide-react';
import { INTERIOR_EXTERIOR_POINTS } from '@/constants/inspection-points';
import { CustomHeadlineItem } from '@/lib/inspection-types';

interface InteriorExteriorSectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  seatsStatus?: 'pass' | 'fail' | 'weak' | 'na';
  onSeatsStatusChange?: (status: 'pass' | 'fail' | 'weak' | 'na') => void;
  seatsImages?: { id: string; url: string }[];
  onSeatsImagesChange?: (images: { id: string; url: string }[]) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
}

export const InteriorExteriorSection: React.FC<InteriorExteriorSectionProps> = ({
  initialComments = '',
  onCommentsChange,
  seatsStatus = 'pass',
  onSeatsStatusChange,
  seatsImages = [],
  onSeatsImagesChange,
  customHeadlines = [],
  onCustomHeadlinesChange,
}) => {
  const [seatsComments, setSeatsComments] = useState(initialComments);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chunk1 = INTERIOR_EXTERIOR_POINTS.chunk1;
  const chunk2 = INTERIOR_EXTERIOR_POINTS.chunk2;
  const chunk3 = INTERIOR_EXTERIOR_POINTS.chunk3;

  const handleSeatsCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSeatsComments(val);
    onCommentsChange?.(val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (files.length > 20) {
      alert(`You can only upload up to 20 images at once.`);
      return;
    }

    const validFiles = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) {
        alert(`File ${f.name} is not a valid image.`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        alert(`File ${f.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(f => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(f)
    }));
    
    onSeatsImagesChange?.([...seatsImages, ...newImages]);
    if (e.target) e.target.value = '';
  };

  const removeSeatsImage = (idToRemove: string) => {
    const img = seatsImages.find(i => i.id === idToRemove);
    if (img?.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
    onSeatsImagesChange?.(seatsImages.filter(i => i.id !== idToRemove));
  };
  const seatsImagesRef = useRef(seatsImages);
  useEffect(() => {
    seatsImagesRef.current = seatsImages;
  }, [seatsImages]);

  const addHeadline = () => {
    onCustomHeadlinesChange?.([...customHeadlines, { id: crypto.randomUUID(), title: '', comments: '' }]);
  };

  const removeHeadline = (id: string) => {
    onCustomHeadlinesChange?.(customHeadlines.filter(h => h.id !== id));
  };

  return (
    <div id="section-interior-exterior" className="flex flex-col gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        multiple
        className="hidden"
      />
      
      <ReusableSection title="Interior & Exterior">
        {/* Top Badges */}
        <div className="flex justify-center items-center gap-3 mt-4 mb-10">
          <StatusBadge label="REPAIRED" type="repaired" />
          <StatusBadge label="DAMAGED" type="damaged" />
          <StatusBadge label="CHECKED" type="checked" />
        </div>

        {/* Car Diagram */}
        <div className="relative w-full max-w-[700px] mx-auto px-6 sm:px-10 mt-6 mb-12">
          <div className="relative w-full">
            <img src="/assets/car-tw.png" alt="Car Top View" className="w-full h-auto block" />
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 659 285" style={{ overflow: 'visible' }}>
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 z" fill="#1E1035" />
                </marker>
              </defs>
              {[
                { id: 12, cx: 100, cy: -30, tx: 150, ty: 120 },
                { id: 13, cx: 180, cy: -30, tx: 190, ty: 70 },
                { id: 7, cx: 250, cy: -30, tx: 270, ty: 142 },
                { id: 4, cx: 320, cy: -30, tx: 320, ty: 100 },
                { id: 3, cx: 390, cy: -30, tx: 380, ty: 120 },
                { id: 8, cx: 460, cy: -30, tx: 440, ty: 100 },
                { id: 11, cx: 530, cy: -30, tx: 480, ty: 120 },
                
                { id: 6, cx: 140, cy: 315, tx: 110, ty: 180 },
                { id: 10, cx: 230, cy: 315, tx: 240, ty: 220 },
                { id: 5, cx: 300, cy: 315, tx: 320, ty: 155 },
                { id: 9, cx: 380, cy: 315, tx: 370, ty: 200 },
                { id: 2, cx: 450, cy: 315, tx: 405, ty: 265 },
                { id: 1, cx: 520, cy: 315, tx: 450, ty: 240 },
                
                { id: 17, cx: -20, cy: 110, tx: 65, ty: 142 },
                { id: 15, cx: -10, cy: 190, tx: 100, ty: 160 },
                
                { id: 16, cx: 679, cy: 110, tx: 590, ty: 142 },
                { id: 14, cx: 669, cy: 190, tx: 540, ty: 170 },
              ].map(p => (
                <g key={p.id}>
                  <path d={`M ${p.cx} ${p.cy} L ${p.tx} ${p.ty}`} stroke="#1E1035" strokeWidth="1" markerEnd="url(#arrowhead)" />
                  <circle cx={p.cx} cy={p.cy} r="14" fill="#000" />
                  <text x={p.cx} y={p.cy} fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                    {p.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend Grid */}
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 px-2 sm:px-8 mt-12 mb-6">
            <div className="flex flex-col gap-3">
              {chunk1.map(item => (
                <div key={item.num} className="flex gap-2.5 text-[12px] font-bold text-[#1E1035]">
                  <span className="w-4">{item.num}.</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {chunk2.map(item => (
                <div key={item.num} className="flex gap-2.5 text-[12px] font-bold text-[#1E1035]">
                  <span className="w-[18px]">{item.num}.</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {chunk3.map(item => (
                <div key={item.num} className="flex gap-2.5 text-[12px] font-bold text-[#1E1035]">
                  <span className="w-[18px]">{item.num}.</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ReusableSection>

      {/* Seats Upholstery Section */}
      <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-5">
            <h3 className="text-[16px] font-bold text-[#1E1035]">Seats Upholstery</h3>
            <div className="flex items-center flex-nowrap bg-[#F4F5F8] p-[3px] rounded-full border border-[#E2E4EB] shrink-0">
              <button 
                type="button"
                onClick={() => onSeatsStatusChange?.('pass')}
                className={`px-5 py-1 rounded-full text-[11px] tracking-wide font-bold transition-all whitespace-nowrap ${
                  seatsStatus === 'pass' ? 'bg-[#71D64B] text-white shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                PASS
              </button>
              <button 
                type="button"
                onClick={() => onSeatsStatusChange?.('fail')}
                className={`px-5 py-1 rounded-full text-[11px] tracking-wide font-bold transition-all whitespace-nowrap ${
                  seatsStatus === 'fail' ? 'bg-[#FE8E4B] text-white shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                FAIL
              </button>
              <button 
                type="button"
                onClick={() => onSeatsStatusChange?.('weak')}
                className={`px-5 py-1 rounded-full text-[11px] tracking-wide font-bold transition-all whitespace-nowrap ${
                  seatsStatus === 'weak' ? 'bg-[#FFED00] text-[#7A7000] shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                WEAK
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
            <input 
              type="text" 
              value={seatsComments}
              onChange={handleSeatsCommentChange}
              maxLength={1000}
              placeholder="Enter observations regarding seats, wear and tear, or stains..." 
              className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-1 focus:ring-[#1E1035]/20 transition-all" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {seatsImages.map((img) => (
              <div key={img.id} className="relative group">
                <ImageUploadBox status="completed" url={img.url} />
                <button
                  type="button"
                  onClick={() => removeSeatsImage(img.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div onClick={() => fileInputRef.current?.click()}>
              <ImageUploadBox status="empty" />
            </div>
          </div>
        </div>
      </section>

      {/* General Comments Section */}
      <GeneralCommentsCard placeholder="General interior & exterior comments..." />

      {/* Default Heading Block */}
      <HeadingCard initialTitle="Dashboard & Infotainment Screen Trim" />

      {/* Dynamically added headlines */}
      {customHeadlines.map(h => (
        <HeadingCard
          key={h.id}
          initialTitle={h.title}
          initialComments={h.comments}
          isRemovable
          onRemove={() => removeHeadline(h.id)}
          onChangeTitle={(title) => {
            onCustomHeadlinesChange?.(customHeadlines.map(ch => ch.id === h.id ? { ...ch, title } : ch));
          }}
          onChangeComments={(comments) => {
            onCustomHeadlinesChange?.(customHeadlines.map(ch => ch.id === h.id ? { ...ch, comments } : ch));
          }}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Interior Headline" />
    </div>
  );
};
