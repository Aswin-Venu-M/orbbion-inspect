"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ImageUploadBox } from './image-upload-box';
import { ImageLightboxModal } from './image-lightbox-modal';
import { Trash2, AlertCircle, X } from 'lucide-react';
import { validateImageFiles, revokeBlobUrl, DEFAULT_MAX_IMAGES } from '@/lib/image-upload-utils';

interface HeadingCardProps {
  initialTitle?: string;
  initialComments?: string;
  initialImageUrl?: string;
  initialImages?: string[];
  onRemove?: () => void;
  isRemovable?: boolean;
  onChangeTitle?: (title: string) => void;
  onChangeComments?: (comments: string) => void;
  onChangeImage?: (url: string | null) => void;
  onChangeImages?: (urls: string[]) => void;
  maxImages?: number;
}

export const HeadingCard: React.FC<HeadingCardProps> = ({
  initialTitle = '',
  initialComments = '',
  initialImageUrl = null,
  initialImages,
  onRemove,
  isRemovable = false,
  onChangeTitle,
  onChangeComments,
  onChangeImage,
  onChangeImages,
  maxImages = DEFAULT_MAX_IMAGES,
}) => {
  const [heading, setHeading] = useState(initialTitle);
  const [comments, setComments] = useState(initialComments);
  
  const getInitialImages = (): string[] => {
    if (initialImages && initialImages.length > 0) return initialImages;
    if (initialImageUrl) return [initialImageUrl];
    return [];
  };

  const [images, setImages] = useState<string[]>(getInitialImages);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setHeading(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    if (initialImages !== undefined) {
      setImages(initialImages);
    } else if (initialImageUrl !== undefined) {
      setImages(initialImageUrl ? [initialImageUrl] : []);
    }
  }, [initialImages, initialImageUrl]);

  useEffect(() => {
    return () => {
      images.forEach((url) => {
        revokeBlobUrl(url);
      });
    };
  }, [images]);

  const addFiles = (files: FileList | File[]) => {
    const { validFiles, errors } = validateImageFiles(files, {
      currentCount: images.length,
      maxImages,
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(' '));
    } else {
      setErrorMessage(null);
    }

    if (validFiles.length > 0) {
      const newUrls = validFiles.map((f) => URL.createObjectURL(f));
      const nextImages = [...images, ...newUrls];
      setImages(nextImages);
      onChangeImages?.(nextImages);
      onChangeImage?.(nextImages[0] || null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const removedUrl = images[index];
    revokeBlobUrl(removedUrl);
    const nextImages = images.filter((_, i) => i !== index);
    setImages(nextImages);
    onChangeImages?.(nextImages);
    onChangeImage?.(nextImages[0] || null);
    setErrorMessage(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const isMaxReached = images.length >= maxImages;

  return (
    <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100 relative group">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        multiple
        className="hidden"
      />
      {isRemovable && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center justify-center shadow-xs cursor-pointer"
          title="Delete headline"
        >
          <Trash2 size={16} />
        </button>
      )}

      {/* Error alert if validation fails */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-xs font-medium animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors cursor-pointer"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
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

        {/* Photos List + Upload Option */}
        <div className="flex flex-wrap gap-4 items-center mt-1">
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="w-[180px] sm:w-[220px] relative group/img">
              <ImageUploadBox 
                status="completed" 
                url={url} 
                onPreview={() => setPreviewUrl(url)} 
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(index);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-30 cursor-pointer opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100"
                title="Remove image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {!isMaxReached ? (
            <div 
              className="w-[180px] sm:w-[220px] cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <ImageUploadBox status="empty" isDragOver={isDragOver} />
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium px-2 py-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center text-center">
              Maximum photo limit ({maxImages}) reached
            </div>
          )}
        </div>
      </div>

      {previewUrl && (
        <ImageLightboxModal 
          imageUrl={previewUrl} 
          title={heading || 'Section Photo'} 
          onClose={() => setPreviewUrl(null)} 
        />
      )}
    </section>
  );
};
