"use client";

import React from 'react';
import { SectionHeader } from '../ui/section-header';
import { InspectionItemCard } from '../ui/inspection-item-card';
import { GeneralCommentsCard } from '../ui/general-comments-card';
import { HeadingCard } from '../ui/heading-card';
import { AddHeadlineButton } from '../ui/add-headline-button';
import { TRANSMISSION_INSPECTION_ITEMS } from '@/constants/inspection-points';
import { CustomHeadlineItem } from '@/lib/inspection-types';

interface TransmissionSectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  generalImages?: string[];
  onGeneralImagesChange?: (images: string[]) => void;
  items?: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>;
  onItemChange?: (id: string, data: Partial<{ status: 'pass' | 'fail' | 'weak'; comments: string; images?: string[] }>) => void;
  customHeadlines?: CustomHeadlineItem[];
  onCustomHeadlinesChange?: (headlines: CustomHeadlineItem[]) => void;
}

export function TransmissionSection({ 
  initialComments = '', 
  onCommentsChange,
  generalImages = [],
  onGeneralImagesChange,
  items = {},
  onItemChange,
  customHeadlines = [],
  onCustomHeadlinesChange
}: TransmissionSectionProps) {
  const defaultHeadlines = customHeadlines.length > 0 ? customHeadlines : [
    { id: 'default-transmission', title: 'Transmission & Drivetrain Diagnostics', comments: '', imageUrl: undefined }
  ];

  const addHeadline = () => {
    if (onCustomHeadlinesChange) {
      onCustomHeadlinesChange([...defaultHeadlines, { id: Math.random().toString(36).substring(7), title: '', comments: '' }]);
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
    <div id="section-transmission" className="flex flex-col gap-2 w-full">
      <SectionHeader title="Transmission" />

      <div className="flex flex-col gap-2">
        {TRANSMISSION_INSPECTION_ITEMS.map((item, index) => {
          const itemData = items[item] || { status: 'pass', comments: '', images: [] };
          return (
            <InspectionItemCard
              key={`${item}-${index}`}
              title={item}
              initialStatus={itemData.status}
              initialComments={itemData.comments}
              imageUrls={itemData.images}
              onStatusChange={(status) => onItemChange?.(item, { status })}
              onCommentsChange={(comments) => onItemChange?.(item, { comments })}
              onImagesChange={(images) => onItemChange?.(item, { images })}
            />
          );
        })}
      </div>

      {/* General Comments Section */}
      <GeneralCommentsCard 
        placeholder="General comments on transmission fluid condition, gear shifting smoothness, differential noise..." 
        initialComments={initialComments}
        onCommentsChange={onCommentsChange}
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
      <AddHeadlineButton onClick={addHeadline} label="Add Transmission Headline" />
    </div>
  );
}
