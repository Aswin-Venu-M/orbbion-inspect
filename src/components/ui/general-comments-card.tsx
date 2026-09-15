"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ImageUploadBox } from './image-upload-box';
import { ImageLightboxModal } from './image-lightbox-modal';
import { Trash2, AlertCircle, X } from 'lucide-react';
import { validateImageFiles, revokeBlobUrl, DEFAULT_MAX_IMAGES } from '@/lib/image-upload-utils';

interface GeneralCommentsCardProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  placeholder?: string;
  initialImages?: string[];
  onImagesChange?: (urls: string[]) => void;
  maxImages?: number;
}

export const GeneralCommentsCard: React.FC<GeneralCommentsCardProps> = ({
  initialComments = '',
  onCommentsChange,
  placeholder = 'Enter general inspection comments and technical recommendations...',
  initialImages = [],
  onImagesChange,
  maxImages = DEFAULT_MAX_IMAGES,
}) => {
  const [comments, setComments] = useState(initialComments);
  const [images, setImages] = useState<string[]>(initialImages);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        revokeBlobUrl(url);
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
      onImagesChange?.(nextImages);
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
    onImagesChange?.(nextImages);
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
    <section className="bg-white rounded-[24px] p-5 lg:p-6 shadow-sm border border-slate-100">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        multiple
        className="hidden"
      />

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
            <div key={`${url}-${i}`} className="w-[180px] sm:w-[220px] relative group/img">
              <ImageUploadBox 
                status="completed" 
                url={url} 
                onPreview={() => setPreviewUrl(url)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(i);
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
          title="General Comments Photo" 
          onClose={() => setPreviewUrl(null)} 
        />
      )}
    </section>
  );
};
