"use client";

import React, { useState, useRef } from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { CarBodyVisualizer, BodyPartStatus, BodyPartId } from './car-body-visualizer';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { GeneralCommentsCard } from '@/components/ui/general-comments-card';
import { HeadingCard } from '@/components/ui/heading-card';
import { AddHeadlineButton } from '@/components/ui/add-headline-button';
import { Trash2 } from 'lucide-react';

interface BodySectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
}

export const BodySection: React.FC<BodySectionProps> = ({
  initialComments = '',
  onCommentsChange,
}) => {
  const [partStatuses, setPartStatuses] = useState<BodyPartStatus>({
    frontBumper: 'good',
    hood: 'good',
    roof: 'good',
    trunk: 'good',
    rearBumper: 'good',
    leftFrontFender: 'good',
    leftFrontDoor: 'good',
    leftBackDoor: 'good',
    leftRearFender: 'good',
    rightFrontFender: 'good',
    rightFrontDoor: 'good',
    rightBackDoor: 'good',
    rightRearFender: 'good',
  });

  const [comments, setComments] = useState(initialComments);
  const [bodyImages, setBodyImages] = useState<string[]>([]);
  const [customHeadlines, setCustomHeadlines] = useState<{ id: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePartClick = (partId: BodyPartId) => {
    setPartStatuses((prev) => {
      const current = prev[partId] || 'good';
      const nextStatus = 
        current === 'good' ? 'repaired' :
        current === 'repaired' ? 'damaged' :
        current === 'damaged' ? 'checked' : 'good';
      return { ...prev, [partId]: nextStatus };
    });
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
    setBodyImages(prev => [...prev, ...newUrls]);
    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    setBodyImages(prev => {
      const url = prev[index];
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const addHeadline = () => {
    setCustomHeadlines(prev => [...prev, { id: Math.random().toString(36).substring(7) }]);
  };

  const removeHeadline = (id: string) => {
    setCustomHeadlines(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div id="section-body" className="flex flex-col gap-6 w-full">
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
          <CarBodyVisualizer statuses={partStatuses} onPartClick={handlePartClick} />

          {/* Comments Section */}
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
            <input 
              type="text" 
              value={comments}
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
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="w-[180px]" onClick={() => fileInputRef.current?.click()}>
              <ImageUploadBox status="empty" />
            </div>
          </div>
        </div>
      </ReusableSection>

      {/* General Comments Section */}
      <GeneralCommentsCard placeholder="General body comments and structural observations..." />

      {/* Default Heading Block */}
      <HeadingCard initialTitle="Underbody Shield & Chassis Frame" />

      {/* Dynamically added headlines */}
      {customHeadlines.map(h => (
        <HeadingCard
          key={h.id}
          isRemovable
          onRemove={() => removeHeadline(h.id)}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Body Headline" />
    </div>
  );
};
