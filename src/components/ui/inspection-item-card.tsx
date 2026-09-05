"use client";

import React, { useState, useRef } from 'react';
import { ImageUploadBox } from './image-upload-box';

interface InspectionItemCardProps {
  title: string;
  hasMultipleImages?: boolean;
  showToggle?: boolean;
  initialStatus?: 'pass' | 'fail' | 'weak';
  initialComments?: string;
  onStatusChange?: (status: 'pass' | 'fail' | 'weak') => void;
  onCommentsChange?: (comments: string) => void;
}

export const InspectionItemCard: React.FC<InspectionItemCardProps> = ({
  title,
  hasMultipleImages = false,
  showToggle = true,
  initialStatus = 'pass',
  initialComments = '',
  onStatusChange,
  onCommentsChange,
}) => {
  const [status, setStatus] = useState<'pass' | 'fail' | 'weak'>(initialStatus);
  const [comments, setComments] = useState<string>(initialComments);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStatusClick = (newStatus: 'pass' | 'fail' | 'weak') => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setComments(val);
    onCommentsChange?.(val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
    setImageUrls(prev => [...prev, ...newUrls]);
    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => {
      const urlToRemove = prev[index];
      if (urlToRemove?.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRemove);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple={hasMultipleImages}
        className="hidden"
      />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-5">
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#1E1035]">{title}</h3>
          {showToggle && (
            <div className="flex items-center flex-nowrap bg-[#F4F5F8] p-[3px] rounded-full border border-[#E2E4EB] shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleStatusClick('pass')}
                className={`px-3.5 sm:px-6 py-1 rounded-full text-[11px] tracking-wide font-bold transition-all whitespace-nowrap ${
                  status === 'pass' ? 'bg-[#71D64B] text-white shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                PASS
              </button>
              <button
                type="button"
                onClick={() => handleStatusClick('fail')}
                className={`px-3.5 sm:px-6 py-1 rounded-full text-[11px] tracking-wide font-bold transition-all whitespace-nowrap ${
                  status === 'fail' ? 'bg-[#FE8E4B] text-white shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                FAIL
              </button>
              <button
                type="button"
                onClick={() => handleStatusClick('weak')}
                className={`px-3.5 sm:px-6 py-1 rounded-full text-[11px] tracking-wide font-bold transition-all whitespace-nowrap ${
                  status === 'weak' ? 'bg-[#FFED00] text-[#7A7000] shadow-sm' : 'text-[#74768B] hover:text-[#1E1035]'
                }`}
              >
                WEAK
              </button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
          <input 
            type="text" 
            value={comments}
            onChange={handleCommentChange}
            placeholder={`Enter remarks for ${title.toLowerCase()}`} 
            className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-2 focus:ring-[#1E1035]/20 transition-all" 
          />
        </div>

        {hasMultipleImages ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative group">
                <ImageUploadBox status="completed" url={url} />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            <div onClick={() => fileInputRef.current?.click()}>
              <ImageUploadBox status="empty" />
            </div>
          </div>
        ) : (
          <div className="w-full sm:w-[220px] mt-1">
            {imageUrls.length > 0 ? (
              <div className="relative group">
                <ImageUploadBox status="completed" url={imageUrls[0]} />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(0)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()}>
                <ImageUploadBox status="empty" />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
