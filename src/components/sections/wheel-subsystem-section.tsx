"use client";

import React from 'react';
import { ReusableSection } from '@/components/ui/reusable-section';
import { ChassisVisualizer, InspectionState } from '@/components/ui/chassis-visualizer';
import { InspectionDetailCard, InspectionDetailState } from '@/components/ui/inspection-detail-card';

const WHEEL_POSITIONS: Array<{ id: string; label: string }> = [
  { id: 'RR', label: 'Rear Right (RR)' },
  { id: 'RL', label: 'Rear Left (RL)' },
  { id: 'FR', label: 'Front Right (FR)' },
  { id: 'FL', label: 'Front Left (FL)' },
  { id: 'ST', label: 'Spare tyre (ST)' },
];

export interface WheelSubsystemSectionProps {
  id: string;
  title: string;
  items: Record<string, InspectionDetailState>;
  onStatusChange: (id: string, status: InspectionState) => void;
  onDataChange: (id: string, data: Partial<InspectionDetailState>) => void;
  onImageClick: (id: string) => void;
  onChooseFromGallery: (id: string, title: string) => void;
}

export const WheelSubsystemSection: React.FC<WheelSubsystemSectionProps> = ({
  id,
  title,
  items = {},
  onStatusChange,
  onDataChange,
  onImageClick,
  onChooseFromGallery,
}) => {
  return (
    <div id={id} className="flex flex-col gap-2 scroll-mt-6">
      <ReusableSection title={title} className="pb-8">
        <ChassisVisualizer items={items} setItemStatus={onStatusChange} />
      </ReusableSection>
      <div className="flex flex-col gap-2">
        {WHEEL_POSITIONS.map(({ id: posId, label }) => (
          <InspectionDetailCard 
            key={posId}
            title={label} 
            data={items[posId] || { status: null, year: '', comments: '', image: null }} 
            onChange={(d) => onDataChange(posId, d)} 
            onImageClick={() => onImageClick(posId)} 
            onChooseFromGallery={() => onChooseFromGallery(posId, `${title} ${label}`)}
          />
        ))}
      </div>
    </div>
  );
};
