"use client";

import React, { useRef, useMemo, useState } from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { CarBodyVisualizer, BodyPartStatus, BodyPartId, BodyPartStatusValue } from './car-body-visualizer';
import { INITIAL_BODY_PART_STATUSES } from '@/constants/visualizers';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { ImageLightboxModal } from '@/components/ui/image-lightbox-modal';
import { GeneralCommentsCard } from '@/components/ui/general-comments-card';
import { HeadingCard } from '@/components/ui/heading-card';
import { AddHeadlineButton } from '@/components/ui/add-headline-button';
import { Trash2, AlertCircle, X } from 'lucide-react';
import { CustomHeadlineItem } from '@/lib/inspection-types';
import { validateImageFiles, DEFAULT_MAX_IMAGES } from '@/lib/image-upload-utils';
import { useMediaConnectionOptional } from '@/lib/media-connection-context';
import { generateSafeId } from '@/lib/media-targets';

interface BodySectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  partStatuses?: Record<string, string>;
  onPartStatusesChange?: (statuses: Record<string, string>) => void;
  bodyImages?: string[];
  onBodyImagesChange?: (images: string[]) => void;
  generalComments?: string;
  onGeneralCommentsChange?: (comments: string) => void;
  generalImages?: string[];
  onGeneralImagesChange?: (images: string[]) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
  maxImages?: number;
}

export const BodySection: React.FC<BodySectionProps> = ({
  initialComments = '',
  onCommentsChange,
  partStatuses = INITIAL_BODY_PART_STATUSES,
  onPartStatusesChange,
  bodyImages = [],
  onBodyImagesChange,
  generalComments = '',
  onGeneralCommentsChange,
  generalImages = [],
  onGeneralImagesChange,
  customHeadlines = [],
  onCustomHeadlinesChange,
  maxImages = DEFAULT_MAX_IMAGES,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Normalize statuses so every part has a defined value even if a sparse object is passed
  const normalizedStatuses = useMemo(() => {
    return {
      ...INITIAL_BODY_PART_STATUSES,
      ...(partStatuses || {})
    };
  }, [partStatuses]);

  const defaultHeadlines = customHeadlines.length > 0 ? customHeadlines : [
    { id: 'default-body', title: 'Underbody Shield & Chassis Frame', comments: '', imageUrl: undefined }
  ];

  const handlePartStatusSelect = (partId: BodyPartId, status: BodyPartStatusValue) => {
    if (onPartStatusesChange) {
      onPartStatusesChange({ ...normalizedStatuses, [partId]: status });
    }
  };

  const handlePartClick = (partId: BodyPartId) => {
    // Panel clicked - popup opens via CarBodyVisualizer
  };

  const handleBatchStatusChange = (newStatuses: BodyPartStatus) => {
    if (onPartStatusesChange) {
      onPartStatusesChange(newStatuses as Record<string, string>);
    }
  };

  const mediaContext = useMediaConnectionOptional();

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onCommentsChange) {
      onCommentsChange(val);
    }
  };

  const addFiles = (files: FileList | File[]) => {
    const { validFiles, errors } = validateImageFiles(files, {
      currentCount: bodyImages.length,
      maxImages,
    });

    if (errors.length > 0) {
      setErrorMessage(errors.join(' '));
    } else {
      setErrorMessage(null);
    }

    if (validFiles.length > 0 && onBodyImagesChange) {
      const newUrls = validFiles.map(f => {
        const url = URL.createObjectURL(f);
        mediaContext?.addDirectUpload(f, f.name);
        return url;
      });
      onBodyImagesChange([...bodyImages, ...newUrls]);
    }
  };

  const handleAddMediaUrl = (url: string) => {
    if (!onBodyImagesChange) return;
    if (bodyImages.includes(url)) {
      setErrorMessage('This photo is already attached to this section');
      return;
    }
    if (bodyImages.length >= maxImages) {
      setErrorMessage(`Maximum photo limit (${maxImages}) reached for this section`);
      return;
    }
    onBodyImagesChange([...bodyImages, url]);
    setErrorMessage(null);
  };

  const handleGallerySelect = () => {
    if (mediaContext) {
      mediaContext.openGalleryPicker({
        title: 'Add Photos to Body & Blueprint',
        multiple: true,
        onSelect: (selectedUrls) => {
          if (!onBodyImagesChange) return;
          const toAdd = selectedUrls.filter(u => !bodyImages.includes(u));
          const availableSlots = maxImages - bodyImages.length;
          const finalAdd = toAdd.slice(0, availableSlots);
          if (finalAdd.length > 0) {
            onBodyImagesChange([...bodyImages, ...finalAdd]);
          }
        },
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // 1. Check for Media Bar dragged item
    const mediaJson = e.dataTransfer.getData('application/x-orbbion-media');
    if (mediaJson) {
      try {
        const parsed = JSON.parse(mediaJson);
        if (parsed.url) {
          handleAddMediaUrl(parsed.url);
          return;
        }
      } catch {
        // ignore
      }
    }

    const textUrl = e.dataTransfer.getData('text/plain');
    if (textUrl && (textUrl.startsWith('blob:') || textUrl.startsWith('http'))) {
      handleAddMediaUrl(textUrl);
      return;
    }

    // 2. Fallback to OS files
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

  const removeImage = (index: number) => {
    if (onBodyImagesChange) {
      const newImages = [...bodyImages];
      newImages.splice(index, 1);
      onBodyImagesChange(newImages);
      setErrorMessage(null);
    }
  };

  const addHeadline = () => {
    if (onCustomHeadlinesChange) {
      onCustomHeadlinesChange([...defaultHeadlines, { id: generateSafeId(), title: '', comments: '' }]);
    }
  };

  const removeHeadline = (id: string) => {
    if (onCustomHeadlinesChange) {
      onCustomHeadlinesChange(defaultHeadlines.filter(h => h.id !== id));
    }
  };

  const updateHeadline = (id: string, updates: Partial<CustomHeadlineItem>) => {
    if (onCustomHeadlinesChange) {
      onCustomHeadlinesChange(defaultHeadlines.map(h => h.id === id ? { ...h, ...updates } : h));
    }
  };

  return (
    <div id="section-body" className="flex flex-col gap-2 w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        multiple
        className="hidden"
      />
      
      <ReusableSection title="Body">
        <div className="flex flex-col gap-6">
          {/* Car Body Blueprint Visualizer */}
          <CarBodyVisualizer 
            statuses={normalizedStatuses as BodyPartStatus} 
            onPartClick={handlePartClick} 
            onPartStatusSelect={handlePartStatusSelect}
            onBatchStatusChange={handleBatchStatusChange}
          />

          {/* Comments Section */}
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
            <input 
              type="text" 
              value={initialComments}
              onChange={handleCommentChange}
              placeholder="Enter comments on car body paint, dents, alignment..." 
              className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-1 focus:ring-[#1E1035]/20 transition-all" 
            />
          </div>

          {/* Error alert if validation fails */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-xs font-medium animate-in fade-in duration-200">
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

          {/* Image Upload Box */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-3 sm:gap-4 items-center w-full">
            {bodyImages.map((url, i) => (
              <div key={i} className="w-full md:w-[180px] relative group/img">
                <ImageUploadBox 
                  status="completed" 
                  url={url} 
                  onPreview={() => setPreviewUrl(url)}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10 cursor-pointer opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100"
                  title="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            
            {bodyImages.length < maxImages ? (
              <div 
                className="w-full md:w-[180px] cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImageUploadBox 
                  status="empty" 
                  isDragOver={isDragOver} 
                  onChooseFromGallery={handleGallerySelect}
                  onDropMediaUrl={handleAddMediaUrl}
                />
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-medium px-4 py-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-center text-center col-span-2 sm:col-span-1">
                Maximum limit ({maxImages}) reached
              </div>
            )}
          </div>
        </div>
      </ReusableSection>

      {/* General Comments Section */}
      <GeneralCommentsCard 
        placeholder="General body comments and structural observations..." 
        initialComments={generalComments}
        onCommentsChange={onGeneralCommentsChange}
        initialImages={generalImages}
        onImagesChange={onGeneralImagesChange}
      />

      {/* Dynamically added headlines including the default one */}
      {defaultHeadlines.map((h, index) => (
        <HeadingCard
          key={h.id}
          initialTitle={h.title}
          initialComments={h.comments}
          initialImageUrl={h.imageUrl}
          initialImages={h.images || (h.imageUrl ? [h.imageUrl] : [])}
          isRemovable={index !== 0} // Make the first one non-removable
          onRemove={() => removeHeadline(h.id)}
          onChangeTitle={(title) => updateHeadline(h.id, { title })}
          onChangeComments={(comments) => updateHeadline(h.id, { comments })}
          onChangeImage={(imageUrl) => updateHeadline(h.id, { imageUrl: imageUrl || undefined })}
          onChangeImages={(images) => updateHeadline(h.id, { images, imageUrl: images[0] || undefined })}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Body Headline" />

      {previewUrl && (
        <ImageLightboxModal 
          imageUrl={previewUrl} 
          title="Body Inspection Photo" 
          onClose={() => setPreviewUrl(null)} 
        />
      )}
    </div>
  );
};
