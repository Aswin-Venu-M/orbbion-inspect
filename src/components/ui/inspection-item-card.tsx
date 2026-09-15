"use client";

import React, { useState, useRef } from 'react';
import { ImageUploadBox } from './image-upload-box';
import { Trash2 } from 'lucide-react';
import { useMediaConnection } from '@/lib/media-connection-context';

interface InspectionItemCardProps {
  title: string;
  hasMultipleImages?: boolean;
  showToggle?: boolean;
  initialStatus?: 'pass' | 'fail' | 'weak';
  initialComments?: string;
  imageUrls?: string[];
  onStatusChange?: (status: 'pass' | 'fail' | 'weak') => void;
  onCommentsChange?: (comments: string) => void;
  onImagesChange?: (urls: string[]) => void;
  onChooseFromGallery?: () => void;
}

export const InspectionItemCard: React.FC<InspectionItemCardProps> = ({
  title,
  hasMultipleImages = true,
  showToggle = true,
  initialStatus = 'pass',
  initialComments = '',
  imageUrls: externalImageUrls,
  onStatusChange,
  onCommentsChange,
  onImagesChange,
  onChooseFromGallery,
}) => {
  const [status, setStatus] = useState<'pass' | 'fail' | 'weak'>(initialStatus);
  const [comments, setComments] = useState<string>(initialComments);
  const [localImageUrls, setLocalImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optional media context
  let mediaContext: ReturnType<typeof useMediaConnection> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    mediaContext = useMediaConnection();
  } catch {
    // ignore
  }

  React.useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  React.useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const displayImageUrls = externalImageUrls ?? localImageUrls;

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
    const newUrls = Array.from(files).map(f => {
      const url = URL.createObjectURL(f);
      mediaContext?.addDirectUpload(f, f.name);
      return url;
    });
    
    if (onImagesChange) {
      onImagesChange([...displayImageUrls, ...newUrls]);
    } else {
      setLocalImageUrls(prev => [...prev, ...newUrls]);
    }
    
    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const urlToRemove = displayImageUrls[index];
    if (urlToRemove?.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
    }
    
    const newUrls = displayImageUrls.filter((_, i) => i !== index);
    if (onImagesChange) {
      onImagesChange(newUrls);
    } else {
      setLocalImageUrls(newUrls);
    }
  };

  const handleAddMediaUrl = (url: string) => {
    if (displayImageUrls.includes(url)) {
      mediaContext?.showToast('Photo is already attached to this item', 'info');
      return;
    }
    const nextUrls = [...displayImageUrls, url];
    if (onImagesChange) {
      onImagesChange(nextUrls);
    } else {
      setLocalImageUrls(nextUrls);
    }
  };

  const handleGallerySelect = () => {
    if (onChooseFromGallery) {
      onChooseFromGallery();
    } else if (mediaContext) {
      mediaContext.openGalleryPicker({
        title: `Choose Photos for ${title}`,
        multiple: hasMultipleImages,
        onSelect: (selectedUrls) => {
          const toAdd = selectedUrls.filter(u => !displayImageUrls.includes(u));
          if (toAdd.length > 0) {
            const next = [...displayImageUrls, ...toAdd];
            if (onImagesChange) {
              onImagesChange(next);
            } else {
              setLocalImageUrls(next);
            }
          }
        },
      });
    }
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

        <div className="flex flex-wrap gap-4 items-center mt-2">
          {displayImageUrls.map((url, i) => (
            <div key={`${url}-${i}`} className="w-[180px] sm:w-[200px] relative group">
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
            className="w-[180px] sm:w-[200px] cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageUploadBox 
              status="empty" 
              onChooseFromGallery={handleGallerySelect}
              onDropMediaUrl={handleAddMediaUrl}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
