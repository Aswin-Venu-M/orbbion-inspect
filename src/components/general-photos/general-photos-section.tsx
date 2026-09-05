"use client";

import React, { useState, useRef } from 'react';
import { SectionHeader } from '@/components/ui/section-header';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { Trash2 } from 'lucide-react';

interface PhotoCategoryCardProps {
  title: string;
  comments: string;
  onCommentsChange: (val: string) => void;
}

const PhotoCategoryCard: React.FC<PhotoCategoryCardProps> = ({ title, comments, onCommentsChange }) => {
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
    setImages(prev => [...prev, ...newUrls]);
    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const url = prev[index];
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-[16px] font-bold text-[#1E1035]">{title}</h3>
      
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
        <input 
          type="text" 
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          placeholder="Enter comments" 
          className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all" 
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center mt-2">
        {images.map((url, i) => (
          <div key={i} className="w-[180px] relative group">
            <ImageUploadBox status="completed" url={url} />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <div className="w-[180px]" onClick={() => fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          <ImageUploadBox status="empty" />
        </div>
      </div>
    </div>
  );
};

interface GeneralPhotosSectionProps {
  exteriorComments?: string;
  interiorComments?: string;
  engineComments?: string;
  inspectorComments?: string;
  onExteriorCommentsChange?: (val: string) => void;
  onInteriorCommentsChange?: (val: string) => void;
  onEngineCommentsChange?: (val: string) => void;
  onInspectorCommentsChange?: (val: string) => void;
}

export const GeneralPhotosSection: React.FC<GeneralPhotosSectionProps> = ({
  exteriorComments = '',
  interiorComments = '',
  engineComments = '',
  onExteriorCommentsChange,
  onInteriorCommentsChange,
  onEngineCommentsChange,
}) => {
  return (
    <div id="section-general-photos" className="flex flex-col gap-2 w-full scroll-mt-6">
      <SectionHeader title="General Photos" />
      
      {/* Exterior - Separate white card */}
      <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
        <PhotoCategoryCard 
          title="Exterior" 
          comments={exteriorComments} 
          onCommentsChange={onExteriorCommentsChange || (() => {})} 
        />
      </section>
      
      {/* Interior - Separate white card */}
      <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
        <PhotoCategoryCard 
          title="Interior" 
          comments={interiorComments} 
          onCommentsChange={onInteriorCommentsChange || (() => {})} 
        />
      </section>
      
      {/* Engine Bay & Undercarriage - Separate white card */}
      <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
        <PhotoCategoryCard 
          title="Engine Bay & Undercarriage" 
          comments={engineComments} 
          onCommentsChange={onEngineCommentsChange || (() => {})} 
        />
      </section>
    </div>
  );
};
