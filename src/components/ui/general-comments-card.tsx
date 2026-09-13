"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ImageUploadBox } from './image-upload-box';
import { Trash2 } from 'lucide-react';

interface GeneralCommentsCardProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  placeholder?: string;
}

export const GeneralCommentsCard: React.FC<GeneralCommentsCardProps> = ({
  initialComments = '',
  onCommentsChange,
  placeholder = 'Enter general inspection comments and technical recommendations...',
}) => {
  const [comments, setComments] = useState(initialComments);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = React.useId();
  const pendingValueRef = useRef<string | null>(null);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external initialComments changes (undo/redo, reset, parent update)
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [imageUrl]);

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
    const file = e.target.files?.[0];
    if (file) {
      if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
      setImageUrl(URL.createObjectURL(file));
    }
    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
  };

  return (
    <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
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

        <div className="w-full sm:w-[220px] mt-1">
          {imageUrl ? (
            <div className="relative group">
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
