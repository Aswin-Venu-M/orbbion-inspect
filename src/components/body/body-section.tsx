"use client";

import React, { useRef, useMemo } from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { CarBodyVisualizer, BodyPartStatus, BodyPartId } from './car-body-visualizer';
import { INITIAL_BODY_PART_STATUSES } from '@/constants/visualizers';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { GeneralCommentsCard } from '@/components/ui/general-comments-card';
import { HeadingCard } from '@/components/ui/heading-card';
import { AddHeadlineButton } from '@/components/ui/add-headline-button';
import { Trash2 } from 'lucide-react';
import { CustomHeadlineItem } from '@/lib/inspection-types';

interface BodySectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  partStatuses?: Record<string, string>;
  onPartStatusesChange?: (statuses: Record<string, string>) => void;
  bodyImages?: string[];
  onBodyImagesChange?: (images: string[]) => void;
  generalComments?: string;
  onGeneralCommentsChange?: (comments: string) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
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
  customHeadlines = [],
  onCustomHeadlinesChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePartClick = (partId: BodyPartId) => {
    const current = normalizedStatuses[partId] || 'good';
    const nextStatus = 
      current === 'good' ? 'repaired' :
      current === 'repaired' ? 'damaged' :
      current === 'damaged' ? 'checked' : 'good';
    
    if (onPartStatusesChange) {
      onPartStatusesChange({ ...normalizedStatuses, [partId]: nextStatus });
    }
  };

  const handleBatchStatusChange = (newStatuses: BodyPartStatus) => {
    if (onPartStatusesChange) {
      onPartStatusesChange(newStatuses as Record<string, string>);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onCommentsChange) {
      onCommentsChange(val);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
    if (onBodyImagesChange) {
      onBodyImagesChange([...bodyImages, ...newUrls]);
    }
    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    if (onBodyImagesChange) {
      const removed = bodyImages[index];
      if (removed && removed.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(removed);
        } catch {
          // ignore error
        }
      }
      const newImages = [...bodyImages];
      newImages.splice(index, 1);
      onBodyImagesChange(newImages);
    }
  };

  const addHeadline = () => {
    if (onCustomHeadlinesChange) {
      const uniqueId = `body-h-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
      onCustomHeadlinesChange([...defaultHeadlines, { id: uniqueId, title: '', comments: '' }]);
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
        accept="image/*"
        multiple
        className="hidden"
      />
      
      <ReusableSection title="Body">
        <div className="flex flex-col gap-6">
          {/* Car Body Blueprint Visualizer */}
          <CarBodyVisualizer 
            statuses={normalizedStatuses as BodyPartStatus} 
            onPartClick={handlePartClick} 
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

          {/* Image Upload Box */}
          <div className="flex flex-wrap gap-4 items-center">
            {bodyImages.map((url, i) => (
              <div key={i} className="w-[180px] relative group">
                <ImageUploadBox status="completed" url={url} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="w-[180px] cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <ImageUploadBox status="empty" />
            </div>
          </div>
        </div>
      </ReusableSection>

      {/* General Comments Section */}
      <GeneralCommentsCard 
        placeholder="General body comments and structural observations..." 
        initialComments={generalComments}
        onCommentsChange={onGeneralCommentsChange}
      />

      {/* Dynamically added headlines including the default one */}
      {defaultHeadlines.map((h, index) => (
        <HeadingCard
          key={h.id}
          initialTitle={h.title}
          initialComments={h.comments}
          initialImageUrl={h.imageUrl}
          isRemovable={index !== 0} // Make the first one non-removable
          onRemove={() => removeHeadline(h.id)}
          onChangeTitle={(title) => updateHeadline(h.id, { title })}
          onChangeComments={(comments) => updateHeadline(h.id, { comments })}
          onChangeImage={(imageUrl) => updateHeadline(h.id, { imageUrl: imageUrl || undefined })}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Body Headline" />
    </div>
  );
};
