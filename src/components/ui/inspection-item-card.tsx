"use client";

import React, { useState, useRef } from 'react';
import { ImageUploadBox } from './image-upload-box';
import { Trash2 } from 'lucide-react';
import { VerificationStatusTabs } from './verification-status-tabs';
import { useMediaConnectionOptional } from '@/lib/media-connection-context';

interface InspectionItemCardProps {
  id?: string;
  title: string;
  hasMultipleImages?: boolean;
  showToggle?: boolean;
  status?: 'pass' | 'fail' | 'weak';
  initialStatus?: 'pass' | 'fail' | 'weak';
  comments?: string;
  initialComments?: string;
  imageUrls?: string[];
  onStatusChange?: (status: 'pass' | 'fail' | 'weak') => void;
  onCommentsChange?: (comments: string) => void;
  onImagesChange?: (urls: string[]) => void;
  onChooseFromGallery?: () => void;
}

export const InspectionItemCard: React.FC<InspectionItemCardProps> = ({
  id,
  title,
  hasMultipleImages = true,
  showToggle = true,
  status: controlledStatus,
  initialStatus = 'pass',
  comments: controlledComments,
  initialComments = '',
  imageUrls: externalImageUrls,
  onStatusChange,
  onCommentsChange,
  onImagesChange,
  onChooseFromGallery,
}) => {
  const activeStatus = controlledStatus ?? initialStatus;
  const [localComments, setLocalComments] = useState<string>(controlledComments ?? initialComments);
  const [localImageUrls, setLocalImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaContext = useMediaConnectionOptional();

  React.useEffect(() => {
    setLocalComments(controlledComments ?? initialComments);
  }, [controlledComments, initialComments]);

  const displayImageUrls = externalImageUrls ?? localImageUrls;

  const handleStatusClick = (newStatus: 'pass' | 'fail' | 'weak') => {
    onStatusChange?.(newStatus);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalComments(val);
    onCommentsChange?.(val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls = Array.from(files).map(f => {
      return mediaContext ? mediaContext.addDirectUpload(f, f.name) : URL.createObjectURL(f);
    });
    
    if (onImagesChange) {
      onImagesChange([...displayImageUrls, ...newUrls]);
    } else {
      setLocalImageUrls(prev => [...prev, ...newUrls]);
    }
    
    if (e.target) e.target.value = '';
  };

  const handleDropFiles = (files: FileList) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) return;
    const newUrls = valid.map(f => {
      return mediaContext ? mediaContext.addDirectUpload(f, f.name) : URL.createObjectURL(f);
    });
    if (onImagesChange) {
      onImagesChange([...displayImageUrls, ...newUrls]);
    } else {
      setLocalImageUrls(prev => [...prev, ...newUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
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
            <VerificationStatusTabs
              value={activeStatus}
              onChange={(newStatus) => handleStatusClick(newStatus as 'pass' | 'fail' | 'weak')}
              includeNa={false}
              layoutId={`status-item-${id || title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            />
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
          <input 
            type="text" 
            value={localComments}
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
              onDropFiles={handleDropFiles}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
