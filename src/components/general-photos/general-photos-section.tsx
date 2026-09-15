"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SectionHeader } from '@/components/ui/section-header';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { Trash2 } from 'lucide-react';
import { useMediaConnectionOptional } from '@/lib/media-connection-context';
import { generateSafeId } from '@/lib/media-targets';

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
  const mediaContext = useMediaConnectionOptional();

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
      if (f.size > 10 * 1024 * 1024) {
        setErrorMessage(`File "${f.name}" is too large. Maximum size is 10MB.`);
        continue;
      }
      validFiles.push(f);
    }

    if (validFiles.length > 0) {
      const newImages = validFiles.map(f => {
        const url = URL.createObjectURL(f);
        mediaContext?.addDirectUpload(f, f.name);
        return {
          id: generateSafeId(),
          url,
        };
      });
      onImagesChange([...images, ...newImages]);
    }
    if (e.target) e.target.value = '';
  };

  const removeImage = (idToRemove: string) => {
    onImagesChange(images.filter(i => i.id !== idToRemove));
  };

  const handleAddMediaUrl = (url: string) => {
    if (images.some(i => i.url === url)) {
      setErrorMessage('This photo is already attached to this category');
      return;
    }
    if (images.length >= 20) {
      setErrorMessage('Maximum photo limit (20) reached for this category');
      return;
    }
    onImagesChange([...images, { id: generateSafeId(), url }]);
  };

  const handleGallerySelect = () => {
    if (mediaContext) {
      mediaContext.openGalleryPicker({
        title: `Add Photos to ${title}`,
        multiple: true,
        onSelect: (selectedUrls) => {
          const toAdd = selectedUrls.filter(u => !images.some(i => i.url === u));
          const availableSlots = 20 - images.length;
          const finalAdd = toAdd.slice(0, availableSlots).map(u => ({
            id: generateSafeId(),
            url: u,
          }));
          if (finalAdd.length > 0) {
            onImagesChange([...images, ...finalAdd]);
          }
        },
      });
    }
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
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
          <ImageUploadBox 
            status="empty" 
            onChooseFromGallery={handleGallerySelect}
            onDropMediaUrl={handleAddMediaUrl}
          />
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
  inspectorComments = '',
  exteriorImages = [],
  interiorImages = [],
  engineImages = [],
  onExteriorCommentsChange = () => {},
  onInteriorCommentsChange = () => {},
  onEngineCommentsChange = () => {},
  onInspectorCommentsChange = () => {},
  onExteriorImagesChange = () => {},
  onInteriorImagesChange = () => {},
  onEngineImagesChange = () => {},
}) => {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader 
        title="General Photos" 
      />

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col gap-8">
        <PhotoCategoryCard 
          title="Exterior" 
          comments={exteriorComments}
          onCommentsChange={onExteriorCommentsChange}
          images={exteriorImages}
          onImagesChange={onExteriorImagesChange}
        />

        <hr className="border-slate-100" />

        <PhotoCategoryCard 
          title="Interior" 
          comments={interiorComments}
          onCommentsChange={onInteriorCommentsChange}
          images={interiorImages}
          onImagesChange={onInteriorImagesChange}
        />

        <hr className="border-slate-100" />

        <PhotoCategoryCard 
          title="Engine" 
          comments={engineComments}
          onCommentsChange={onEngineCommentsChange}
          images={engineImages}
          onImagesChange={onEngineImagesChange}
        />

        <hr className="border-slate-100" />

        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="inspector-general-comments" className="text-[14px] font-bold text-[#1E1035]">Inspector General Remarks</label>
          <textarea 
            id="inspector-general-comments"
            value={inspectorComments}
            onChange={(e) => onInspectorCommentsChange(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Enter overall inspector conclusion and notes about general vehicle condition" 
            className="w-full bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 py-3 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all resize-y" 
          />
        </div>
      </div>
    </div>
  );
};
