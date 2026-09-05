"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SectionHeader } from '@/components/ui/section-header';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { Trash2 } from 'lucide-react';

interface PhotoCategoryCardProps {
  title: string;
  comments: string;
  onCommentsChange: (val: string) => void;
  images: { id: string; url: string }[];
  onImagesChange: (images: { id: string; url: string }[]) => void;
}

const PhotoCategoryCard: React.FC<PhotoCategoryCardProps> = ({ title, comments, onCommentsChange, images, onImagesChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
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
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(f)
    }));
    
    onImagesChange([...images, ...newImages]);
    if (e.target) e.target.value = '';
  };

  const removeImage = (idToRemove: string) => {
    const img = images.find(i => i.id === idToRemove);
    if (img?.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
    onImagesChange(images.filter(i => i.id !== idToRemove));
  };

  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    const currentImages = imagesRef.current;
    return () => {
      currentImages.forEach(img => {
        if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
      });
    };
  }, []);

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
        {images.map((img) => (
          <div key={img.id} className="w-[180px] relative group">
            <ImageUploadBox status="completed" url={img.url} />
            <button
              type="button"
              onClick={() => removeImage(img.id)}
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
  exteriorImages?: { id: string; url: string }[];
  interiorImages?: { id: string; url: string }[];
  engineImages?: { id: string; url: string }[];
  onExteriorCommentsChange?: (val: string) => void;
  onInteriorCommentsChange?: (val: string) => void;
  onEngineCommentsChange?: (val: string) => void;
  onInspectorCommentsChange?: (val: string) => void;
  onExteriorImagesChange?: (images: { id: string; url: string }[]) => void;
  onInteriorImagesChange?: (images: { id: string; url: string }[]) => void;
  onEngineImagesChange?: (images: { id: string; url: string }[]) => void;
}

export const GeneralPhotosSection: React.FC<GeneralPhotosSectionProps> = ({
  exteriorComments = '',
  interiorComments = '',
  engineComments = '',
  exteriorImages = [],
  interiorImages = [],
  engineImages = [],
  onExteriorCommentsChange,
  onInteriorCommentsChange,
  onEngineCommentsChange,
  onExteriorImagesChange,
  onInteriorImagesChange,
  onEngineImagesChange,
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
          images={exteriorImages}
          onImagesChange={onExteriorImagesChange || (() => {})}
        />
      </section>
      
      {/* Interior - Separate white card */}
      <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
        <PhotoCategoryCard 
          title="Interior" 
          comments={interiorComments} 
          onCommentsChange={onInteriorCommentsChange || (() => {})} 
          images={interiorImages}
          onImagesChange={onInteriorImagesChange || (() => {})}
        />
      </section>
      
      {/* Engine Bay & Undercarriage - Separate white card */}
      <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
        <PhotoCategoryCard 
          title="Engine Bay & Undercarriage" 
          comments={engineComments} 
          onCommentsChange={onEngineCommentsChange || (() => {})} 
          images={engineImages}
          onImagesChange={onEngineImagesChange || (() => {})}
        />
      </section>
    </div>
  );
};
