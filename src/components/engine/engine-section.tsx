"use client";

import React, { useState } from 'react';
import { SectionHeader } from '../ui/section-header';
import { InspectionItemCard } from '../ui/inspection-item-card';
import { GeneralCommentsCard } from '../ui/general-comments-card';
import { HeadingCard } from '../ui/heading-card';
import { AddHeadlineButton } from '../ui/add-headline-button';
import { CheckCircle2 } from 'lucide-react';
import { ENGINE_INSPECTION_ITEMS } from '@/constants/inspection-points';

interface EngineSectionProps {
  initialComments?: string;
  onCommentsChange?: (comments: string) => void;
}

export function EngineSection({ initialComments = '', onCommentsChange }: EngineSectionProps) {
  const items = ENGINE_INSPECTION_ITEMS;

  // Key to force reset / re-render if "Mark All" is clicked
  const [bulkStatus, setBulkStatus] = useState<'pass' | 'fail' | 'weak' | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [customHeadlines, setCustomHeadlines] = useState<{ id: string }[]>([]);

  const handleMarkAll = (status: 'pass' | 'fail' | 'weak') => {
    setBulkStatus(status);
    setResetKey(prev => prev + 1);
  };

  const addHeadline = () => {
    setCustomHeadlines(prev => [...prev, { id: Math.random().toString(36).substring(7) }]);
  };

  const removeHeadline = (id: string) => {
    setCustomHeadlines(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div id="section-engine" className="flex flex-col gap-2 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SectionHeader title="Engine" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleMarkAll('pass')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8F8EE] border border-[#B3EBC8] text-[#1E7E34] text-xs font-bold rounded-xl hover:bg-[#D4F3DE] transition-colors"
          >
            <CheckCircle2 size={14} />
            Mark All Pass
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('weak')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFDE6] border border-[#FEEA85] text-[#856404] text-xs font-bold rounded-xl hover:bg-[#FFF9C4] transition-colors"
          >
            <CheckCircle2 size={14} />
            Mark All Weak
          </button>
        </div>
      </div>

      <div key={resetKey} className="flex flex-col gap-2">
        {items.map((item, index) => (
          <InspectionItemCard
            key={`${item}-${index}`}
            title={item}
            initialStatus={bulkStatus || 'pass'}
          />
        ))}
      </div>

      {/* General Comments Section */}
      <GeneralCommentsCard 
        placeholder="General comments on engine idle, oil leaks, mounts, drive belt, or exhaust system..." 
        initialComments={initialComments}
        onCommentsChange={onCommentsChange}
      />

      {/* Default Heading Block */}
      <HeadingCard initialTitle="Engine Compression & Fluid Diagnostics" />

      {/* Dynamically added headlines */}
      {customHeadlines.map(h => (
        <HeadingCard
          key={h.id}
          isRemovable
          onRemove={() => removeHeadline(h.id)}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Engine Headline" />
    </div>
  );
}
