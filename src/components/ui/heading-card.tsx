"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ImageUploadBox } from './image-upload-box';
import { Trash2 } from 'lucide-react';

interface HeadingCardProps {
  initialTitle?: string;
  initialComments?: string;
  onRemove?: () => void;
  isRemovable?: boolean;
  onChangeTitle?: (title: string) => void;
  onChangeComments?: (comments: string) => void;
}

export const HeadingCard: React.FC<HeadingCardProps> = ({
  initialTitle = '',
  initialComments = '',
  onRemove,
  isRemovable = false,
  onChangeTitle,
  onChangeComments,
}) => {
  const [heading, setHeading] = useState(initialTitle);
  const [comments, setComments] = useState(initialComments);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setHeading(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUrl(URL.createObjectURL(file));
    }
    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl(null);
  };

  return (
    <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100 relative group">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
      {isRemovable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center shadow-xs"
          title="Delete headline"
        >
          <Trash2 size={16} />
        </button>
      )}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={`headline-input-${initialTitle.replace(/\s+/g, '-').toLowerCase()}`} className="text-[14px] font-bold text-[#1E1035]">Headline</label>
          <input 
            id={`headline-input-${initialTitle.replace(/\s+/g, '-').toLowerCase()}`}
            type="text" 
            value={heading}
            maxLength={1000}
            onChange={(e) => {
              setHeading(e.target.value);
              onChangeTitle?.(e.target.value);
            }}
            placeholder="Enter custom section heading (e.g. Underbody Shielding)" 
            className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all" 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`remarks-input-${initialTitle.replace(/\s+/g, '-').toLowerCase()}`} className="text-[14px] font-bold text-[#1E1035]">Remarks & Observations</label>
          <textarea 
            id={`remarks-input-${initialTitle.replace(/\s+/g, '-').toLowerCase()}`}
            value={comments}
            maxLength={1000}
            rows={3}
            onChange={(e) => {
              setComments(e.target.value);
              onChangeComments?.(e.target.value);
            }}
            placeholder="Enter notes or remarks for this section" 
            className="w-full bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 py-3 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all resize-y" 
          />
        </div>

        <div className="w-full sm:w-[220px] mt-1">
          {imageUrl ? (
            <div className="relative group/img">
              <ImageUploadBox status="completed" url={imageUrl} />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-30"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()}>
              <ImageUploadBox status="empty" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
