"use client";

import React, { useState } from 'react';
import { SectionHeader } from '../ui/section-header';
import { InspectionItemCard } from '../ui/inspection-item-card';
import { GeneralCommentsCard } from '../ui/general-comments-card';
import { HeadingCard } from '../ui/heading-card';
import { AddHeadlineButton } from '../ui/add-headline-button';
import { TRANSMISSION_INSPECTION_ITEMS } from '@/constants/inspection-points';

interface TransmissionSectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
  transmissionItems?: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string }>;
  onTransmissionItemsChange?: (items: Record<string, { status: 'pass' | 'fail' | 'weak'; comments: string }>) => void;
  customHeadlines?: { id: string; title: string; comments: string; imageUrl?: string }[];
  onCustomHeadlinesChange?: (headlines: { id: string; title: string; comments: string; imageUrl?: string }[]) => void;
}

export function TransmissionSection({ 
  initialComments = '', 
  onCommentsChange,
  transmissionItems = {},
  onTransmissionItemsChange,
  customHeadlines = [],
  onCustomHeadlinesChange
}: TransmissionSectionProps) {
  const items = TRANSMISSION_INSPECTION_ITEMS;

  const addHeadline = () => {
    const newHeadline = { id: crypto.randomUUID(), title: '', comments: '' };
    onCustomHeadlinesChange?.([...customHeadlines, newHeadline]);
  };

  const removeHeadline = (id: string) => {
    onCustomHeadlinesChange?.(customHeadlines.filter(h => h.id !== id));
  };

  const updateHeadlineTitle = (id: string, title: string) => {
    onCustomHeadlinesChange?.(customHeadlines.map(h => h.id === id ? { ...h, title } : h));
  };

  const updateHeadlineComments = (id: string, comments: string) => {
    onCustomHeadlinesChange?.(customHeadlines.map(h => h.id === id ? { ...h, comments } : h));
  };

  const handleItemStatusChange = (item: string, status: 'pass' | 'fail' | 'weak') => {
    onTransmissionItemsChange?.({
      ...transmissionItems,
      [item]: { ...(transmissionItems[item] || { comments: '' }), status }
    });
  };

  const handleItemCommentsChange = (item: string, comments: string) => {
    onTransmissionItemsChange?.({
      ...transmissionItems,
      [item]: { ...(transmissionItems[item] || { status: 'pass' }), comments }
    });
  };

  return (
    <div id="section-transmission" className="flex flex-col gap-2 w-full">
      <SectionHeader title="Transmission" />

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <InspectionItemCard
            key={item}
            title={item}
            initialStatus={transmissionItems[item]?.status || 'pass'}
            initialComments={transmissionItems[item]?.comments || ''}
            onStatusChange={(status) => handleItemStatusChange(item, status)}
            onCommentsChange={(comments) => handleItemCommentsChange(item, comments)}
          />
        ))}
      </div>

      {/* General Comments Section */}
      <GeneralCommentsCard 
        placeholder="General comments on transmission fluid condition, gear shifting smoothness, differential noise..." 
        initialComments={initialComments}
        onCommentsChange={onCommentsChange}
      />

      {/* Default Heading Block */}
      <HeadingCard initialTitle="Transmission & Drivetrain Diagnostics" />

      {/* Dynamically added headlines */}
      {customHeadlines.map(h => (
        <HeadingCard
          key={h.id}
          initialTitle={h.title}
          initialComments={h.comments}
          isRemovable
          onRemove={() => removeHeadline(h.id)}
          onChangeTitle={(title) => updateHeadlineTitle(h.id, title)}
          onChangeComments={(comments) => updateHeadlineComments(h.id, comments)}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Transmission Headline" />
    </div>
  );
}
