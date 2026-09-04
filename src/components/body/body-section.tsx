"use client";

import React, { useState } from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { CarBodyVisualizer, BodyPartStatus, BodyPartId } from './car-body-visualizer';
import { ImageUploadBox } from '@/components/ui/image-upload-box';
import { GeneralCommentsCard } from '@/components/ui/general-comments-card';
import { HeadingCard } from '@/components/ui/heading-card';
import { AddHeadlineButton } from '@/components/ui/add-headline-button';

export const BodySection = () => {
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

  return (
    <div className="flex flex-col gap-6 w-full">
      <ReusableSection title="Body">
        <div className="flex flex-col gap-6">
          {/* Car Body Blueprint Visualizer */}
          <CarBodyVisualizer statuses={partStatuses} onPartClick={handlePartClick} />

          {/* Comments Section */}
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-[14px] font-bold text-[#1E1035]">Comments</label>
            <input 
              type="text" 
              placeholder="Enter comments" 
              className="w-full h-[46px] bg-[#F4F5F8] border border-[#E2E4EB] rounded-[14px] px-4 text-[13px] font-medium text-[#1E1035] placeholder-[#74768B] focus:outline-none focus:ring-1 focus:ring-[#1E1035]/20 transition-all" 
            />
          </div>

          {/* Image Upload Box */}
          <div className="w-full sm:w-[220px]">
            <ImageUploadBox status="empty" />
          </div>
        </div>
      </ReusableSection>

      {/* General Comments Section */}
      <GeneralCommentsCard />

      {/* Heading Block */}
      <HeadingCard />

      {/* Add Headline Button */}
      <AddHeadlineButton />
    </div>
  );
};
