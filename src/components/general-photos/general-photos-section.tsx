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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (images.length + files.length > 20) {
      setErrorMessage(`You can only upload up to 20 images at once.`);
      if (e.target) e.target.value = '';
      return;
    }

    const validFiles: File[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) {
        setErrorMessage(`File "${f.name}" is not a valid image.`);
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        setErrorMessage(`File "${f.name}" is too large. Maximum size is 5MB.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length > 0) {
      const newImages = validFiles.map(f => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(f)
      }));
      onImagesChange([...images, ...newImages]);
    }
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

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-[16px] font-bold text-[#1E1035]">{title}</h3>
      
      <div className="flex flex-col gap-2">
        <label htmlFor={`photo-category-${title.replace(/\s+/g, '-').toLowerCase()}`} className="text-[14px] font-bold text-[#1E1035]">Comments</label>
        <textarea 
          id={`photo-category-${title.replace(/\s+/g, '-').toLowerCase()}`}
          value={comments}
          onChange={(e) => onCommentsChange(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Enter comments" 
          className="w-full bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 py-3 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all resize-y" 
        />
      </div>

      {errorMessage && (
        <div className="flex items-center justify-between text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
          <span>{errorMessage}</span>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)} 
            className="font-bold hover:text-rose-800 ml-2 text-sm leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

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
            accept="image/jpeg, image/png, image/webp"
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
