"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ImageUploadBox } from './image-upload-box';
import { Trash2 } from 'lucide-react';

interface GeneralCommentsCardProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  placeholder?: string;
  initialImages?: string[];
  onImagesChange?: (urls: string[]) => void;
}

export const GeneralCommentsCard: React.FC<GeneralCommentsCardProps> = ({
  initialComments = '',
  onCommentsChange,
  placeholder = 'Enter general inspection comments and technical recommendations...',
  initialImages = [],
  onImagesChange,
}) => {
  const [comments, setComments] = useState(initialComments);
  const [images, setImages] = useState<string[]>(initialImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = React.useId();
  const pendingValueRef = useRef<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external initialComments changes (undo/redo, reset, parent update)
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    if (initialImages) {
      setImages(initialImages);
    }
  }, [initialImages]);

  useEffect(() => {
    return () => {
      images.forEach((url) => {
        if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [images]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setComments(val);
    pendingValueRef.current = val;
    
    if (onCommentsChange) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onCommentsChange(val);
        pendingValueRef.current = null;
        debounceRef.current = null;
      }, 400);
    }
  };

  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      if (pendingValueRef.current !== null && onCommentsChange) {
        onCommentsChange(pendingValueRef.current);
        pendingValueRef.current = null;
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls = Array.from(files).map((f) => URL.createObjectURL(f));
    const nextImages = [...images, ...newUrls];
    setImages(nextImages);
    onImagesChange?.(nextImages);
    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const removedUrl = images[index];
    if (removedUrl?.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(removedUrl);
      } catch {
        // ignore
      }
    }
    const nextImages = images.filter((_, i) => i !== index);
    setImages(nextImages);
    onImagesChange?.(nextImages);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const newUrls = Array.from(files).map((f) => URL.createObjectURL(f));
    const nextImages = [...images, ...newUrls];
    setImages(nextImages);
    onImagesChange?.(nextImages);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        multiple
        className="hidden"
      />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className="text-[14px] font-bold text-[#1E1035]">General Comments</label>
          <textarea 
            id={inputId}
            value={comments}
            onChange={handleCommentChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 py-3 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all resize-y" 
          />
        </div>

        {/* Photos List + Upload Option */}
        <div className="flex flex-wrap gap-4 items-center mt-1">
          {images.map((url, i) => (
            <div key={`${url}-${i}`} className="w-[180px] sm:w-[220px] relative group">
              <ImageUploadBox status="completed" url={url} />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-30 cursor-pointer"
                title="Remove image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div 
            className="w-[180px] sm:w-[220px] cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <ImageUploadBox status="empty" />
          </div>
        </div>
      </div>
    </section>
  );
};
