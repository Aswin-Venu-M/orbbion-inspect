"use client";

import React, { useState } from 'react';
import { SectionHeader } from '../ui/section-header';
import { InspectionItemCard } from '../ui/inspection-item-card';
import { GeneralCommentsCard } from '../ui/general-comments-card';
import { HeadingCard } from '../ui/heading-card';
import { AddHeadlineButton } from '../ui/add-headline-button';
import { ELECTRICAL_INSPECTION_ITEMS } from '@/constants/inspection-points';

export function ElectricalSection() {
  const items = ELECTRICAL_INSPECTION_ITEMS;

  const [customHeadlines, setCustomHeadlines] = useState<{ id: string }[]>([]);

  const addHeadline = () => {
    setCustomHeadlines(prev => [...prev, { id: Math.random().toString(36).substring(7) }]);
  };

  const removeHeadline = (id: string) => {
    setCustomHeadlines(prev => prev.filter(h => h.id !== id));
  };

  return (
    <div id="section-electrical" className="flex flex-col gap-2 w-full">
      <SectionHeader title="Electrical" />

      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <InspectionItemCard
            key={`${item}-${index}`}
            title={item}
            initialStatus="pass"
          />
        ))}
      </div>

      {/* General Comments Section */}
      <GeneralCommentsCard placeholder="General comments on vehicle battery, fuses, wiring harness..." />

      {/* Default Heading Block */}
      <HeadingCard initialTitle="OBD-II Diagnostic Scan & Fault Codes" />

      {/* Dynamically added headlines */}
      {customHeadlines.map(h => (
        <HeadingCard
          key={h.id}
          isRemovable
          onRemove={() => removeHeadline(h.id)}
        />
      ))}

      {/* Add Headline Button */}
      <AddHeadlineButton onClick={addHeadline} label="Add Electrical Headline" />
    </div>
  );
}
